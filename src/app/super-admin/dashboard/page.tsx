"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell, type TabItem } from "@/components/dashboard/DashboardShell";
import { Panel } from "@/components/dashboard/Panel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BarChart3, Users, ShieldCheck, FileText,
  Loader2, RefreshCw, ClipboardList, Database,
} from "lucide-react";
import Link from "next/link";
import { mockRolePermissionMatrix, mockAuditLogs } from "@/lib/mock/superadmin";

/* ── types ── */
type Profile = {
  id: string; full_name: string | null; email: string;
  role: string; is_active: boolean; created_at: string;
};
type AuditLog = {
  id: string; actor_id: string | null; action: string; entity: string;
  detail: string; created_at: string; actor_name?: string;
};
type Analytics = {
  totalPatients: number; totalStaff: number; totalDoctors: number;
  totalAppointments: number; pendingAppointments: number;
  totalInvoices: number; unpaidInvoices: number; totalRevenue: number;
  appointmentsByDept: { department: string; count: number }[];
};

type Tab = "overview" | "users" | "audit" | "roles" | "analytics" | "schema";

const tabs: TabItem[] = [
  { label: "Overview",     value: "overview",   icon: <BarChart3     className="h-[18px] w-[18px]" /> },
  { label: "User Mgmt",   value: "users",      icon: <Users         className="h-[18px] w-[18px]" /> },
  { label: "Audit Logs",  value: "audit",      icon: <ClipboardList className="h-[18px] w-[18px]" /> },
  { label: "Role Matrix", value: "roles",      icon: <ShieldCheck   className="h-[18px] w-[18px]" /> },
  { label: "Analytics",   value: "analytics",  icon: <FileText      className="h-[18px] w-[18px]" /> },
  { label: "DB Schema",   value: "schema",     icon: <Database      className="h-[18px] w-[18px]" /> },
];

import { ROLE_LABELS } from "@/lib/roles";

const staffRoles = [
  "SUPER_ADMIN", "HOSPITAL_ADMIN", "DEPARTMENT_ADMIN",
  "DOCTOR", "NURSE", "RECEPTIONIST",
  "LAB_ADMIN", "LAB_TECHNICIAN",
  "PHARMACY_ADMIN", "PHARMACIST",
  "INSURANCE_ADMIN", "SUPPORT_EXECUTIVE",
  "BILLING", "EMERGENCY", "TELEMEDICINE",
];

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab]   = useState<Tab>("overview");
  const [loading,   setLoading]     = useState(true);
  const [saving,    setSaving]      = useState<string | null>(null);
  const [msg,       setMsg]         = useState("");

  const [users,     setUsers]       = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs]   = useState<AuditLog[]>([]);
  const [analytics, setAnalytics]   = useState<Analytics | null>(null);

  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [auditSearch, setAuditSearch] = useState("");

  const [staffForm, setStaffForm]   = useState({ full_name: "", email: "", password: "", role: "DOCTOR" });
  const [creating,  setCreating]    = useState(false);

  async function load(showLoader = false) {
    if (showLoader) setLoading(true);
    const supabase = createClient();

    const [profilesRes, patientsRes, appointmentsRes, invoicesRes, doctorsRes, auditRes] =
      await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role, is_active, created_at").order("created_at", { ascending: false }),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id, department, status"),
        supabase.from("invoices").select("id, total, status"),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

    const profiles = profilesRes.data ?? [];
    setUsers(profiles);

    /* audit logs — fall back to mock if table empty / doesn't exist */
    const logs = auditRes.data ?? [];
    setAuditLogs(logs.length > 0 ? logs : mockAuditLogs);

    const appts    = appointmentsRes.data ?? [];
    const invoices = invoicesRes.data ?? [];

    const deptMap: Record<string, number> = {};
    appts.forEach(a => { if (a.department) deptMap[a.department] = (deptMap[a.department] || 0) + 1; });
    const byDept = Object.entries(deptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    const totalRevenue = invoices
      .filter(i => i.status === "PAID" || i.status === "paid")
      .reduce((s, i) => s + (i.total ?? 0), 0);

    setAnalytics({
      totalPatients:       patientsRes.count  ?? 0,
      totalDoctors:        doctorsRes.count   ?? profiles.filter(p => p.role === "doctor" || p.role === "DOCTOR").length,
      totalStaff:          profiles.filter(p => p.role !== "patient" && p.role !== "PATIENT").length,
      totalAppointments:   appts.length,
      pendingAppointments: appts.filter(a => a.status === "pending" || a.status === "PENDING").length,
      totalInvoices:       invoices.length,
      unpaidInvoices:      invoices.filter(i => i.status === "UNPAID" || i.status === "unpaid").length,
      totalRevenue,
      appointmentsByDept:  byDept,
    });

    setLoading(false);
  }

  useEffect(() => { load(false); }, []);

  async function toggleActive(user: Profile) {
    setSaving(user.id);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !user.is_active })
      .eq("id", user.id);

    if (error) { setMsg(error.message); }
    else {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      setMsg(`${user.full_name ?? user.email} ${!user.is_active ? "activated" : "deactivated"}.`);
    }
    setSaving(null);
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMsg("");
    const supabase = createClient();
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: staffForm.email,
      password: staffForm.password,
      options: { data: { full_name: staffForm.full_name, role: staffForm.role } },
    });
    if (signUpErr || !data.user) { setMsg(signUpErr?.message ?? "Failed to create auth user."); setCreating(false); return; }
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id, full_name: staffForm.full_name,
      email: staffForm.email, role: staffForm.role, is_active: true,
    });
    if (profileErr) { setMsg(profileErr.message); setCreating(false); return; }
    setStaffForm({ full_name: "", email: "", password: "", role: "DOCTOR" });
    setMsg(`Staff account created for ${staffForm.full_name}.`);
    await load(false);
    setCreating(false);
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.full_name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === "ALL" || u.role === roleFilter || u.role === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const filteredLogs = auditLogs.filter(l => {
    const q = auditSearch.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q)
      || (l.detail ?? "").toLowerCase().includes(q) || (l.actor_name ?? "").toLowerCase().includes(q);
  });

  const usingMockLogs = auditLogs.length > 0 && auditLogs[0].id.startsWith("al-");

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <DashboardShell
      portalName="Super Admin"
      portalSubtitle="System Control Center"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={t => setActiveTab(t as Tab)}
      liveSummary={[
        { label: "Total Users",  value: users.length },
        { label: "Active",       value: users.filter(u => u.is_active).length },
        { label: "Appointments", value: analytics?.totalAppointments ?? 0 },
        { label: "Pending",      value: analytics?.pendingAppointments ?? 0 },
      ]}
    >
      {msg && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-bold text-teal-800">
          {msg}
          <button onClick={() => setMsg("")} className="ml-4 text-teal-500 hover:text-teal-700">✕</button>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Total Patients",  value: analytics?.totalPatients ?? 0,      color: "bg-teal-500"   },
              { label: "Total Staff",     value: analytics?.totalStaff ?? 0,          color: "bg-indigo-500" },
              { label: "Doctors",         value: analytics?.totalDoctors ?? 0,        color: "bg-blue-500"   },
              { label: "Appointments",    value: analytics?.totalAppointments ?? 0,   color: "bg-purple-500" },
              { label: "Pending",         value: analytics?.pendingAppointments ?? 0, color: "bg-orange-500" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-2xl p-6 text-white shadow-lg`}>
                <p className="text-sm font-bold text-white/80">{s.label}</p>
                <p className="mt-2 text-4xl font-black tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Recently Joined Users" subtitle="Last 8 registered accounts">
              <div className="grid gap-3">
                {users.slice(0, 8).map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">{u.full_name ?? "—"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                      <StatusBadge status={u.is_active ? "ACTIVE" : "INACTIVE"} />
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No users yet.</p>}
              </div>
            </Panel>

            <Panel title="Appointments by Department" subtitle="Live distribution">
              {analytics?.appointmentsByDept.length ? (
                <div className="grid gap-3">
                  {analytics.appointmentsByDept.map(d => (
                    <div key={d.department} className="flex items-center gap-3">
                      <p className="w-44 shrink-0 truncate text-sm font-bold text-slate-700">{d.department}</p>
                      <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-3">
                        <div className="h-full rounded-full bg-teal-500 transition-all"
                          style={{ width: `${(d.count / analytics.appointmentsByDept[0].count) * 100}%` }} />
                      </div>
                      <p className="w-8 text-right text-sm font-black text-slate-700">{d.count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No appointment data yet.</p>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* ── USER MANAGEMENT ── */}
      {activeTab === "users" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Panel title="All System Users" subtitle={`${users.length} total accounts`}>
            <div className="mb-4 flex flex-wrap gap-3">
              <input
                className="h-10 min-w-[200px] flex-1 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-teal-500"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="h-10 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-teal-500"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {["SUPER_ADMIN","HOSPITAL_ADMIN","DEPARTMENT_ADMIN","DOCTOR","NURSE","RECEPTIONIST","LAB_ADMIN","LAB_TECHNICIAN","PHARMACY_ADMIN","PHARMACIST","INSURANCE_ADMIN","SUPPORT_EXECUTIVE","PATIENT","BILLING","EMERGENCY","TELEMEDICINE"].map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                ))}
              </select>
              <button
                onClick={() => load(true)}
                className="flex h-10 items-center gap-2 rounded-2xl border border-slate-300 px-4 text-sm font-bold text-slate-600 hover:border-teal-400 hover:text-teal-700"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 text-left text-white">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{u.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={u.is_active ? "ACTIVE" : "INACTIVE"} /></td>
                      <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          disabled={saving === u.id}
                          onClick={() => toggleActive(u)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-black text-white transition disabled:opacity-50 ${
                            u.is_active ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
                        >
                          {saving === u.id ? "…" : u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Create Staff Account" subtitle="Add a new staff member">
            <form onSubmit={createStaff} className="grid gap-4">
              {[
                { label: "Full Name", key: "full_name", type: "text",     placeholder: "Dr. Jane Smith" },
                { label: "Email",     key: "email",     type: "email",    placeholder: "staff@medilink.com" },
                { label: "Password",  key: "password",  type: "password", placeholder: "Min. 6 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</label>
                  <input
                    required type={type} minLength={key === "password" ? 6 : undefined}
                    className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-500"
                    placeholder={placeholder}
                    value={staffForm[key as keyof typeof staffForm]}
                    onChange={e => setStaffForm({ ...staffForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Role</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-500"
                  value={staffForm.role}
                  onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                >
                  {staffRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                </select>
              </div>
              <button
                type="submit" disabled={creating}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 p-3 font-black text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Staff Account"}
              </button>
            </form>
          </Panel>
        </div>
      )}

      {/* ── AUDIT LOGS ── */}
      {activeTab === "audit" && (
        <Panel
          title="Audit Logs"
          subtitle={usingMockLogs ? "⚠ audit_logs table empty — showing mock data" : `${auditLogs.length} entries`}
          action={
            <button onClick={() => load(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          }
        >
          <div className="mb-4">
            <input
              className="h-10 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-teal-500"
              placeholder="Filter by action, entity, actor, or detail…"
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-left text-white">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.actor_name ?? log.actor_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.entity}</td>
                    <td className="px-4 py-3 text-slate-600">{log.detail}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No log entries found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ── ROLE MATRIX (static) ── */}
      {activeTab === "roles" && (
        <Panel title="Role Permission Matrix" subtitle="Module access per role — system reference">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-left text-xs text-white">
                  <th className="px-4 py-3">Module</th>
                  {["SUPER_ADMIN","HOSPITAL_ADMIN","DEPARTMENT_ADMIN","DOCTOR","LAB_ADMIN","PHARMACY_ADMIN","PATIENT"].map(r => (
                    <th key={r} className="px-4 py-3">{ROLE_LABELS[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRolePermissionMatrix.map((row, i) => (
                  <tr key={row.module} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-3 font-bold text-slate-900">{row.module}</td>
                    {[row.SUPER_ADMIN, row.ADMIN, row.DOCTOR, row.TESTER, row.PHARMACIST, row.EMERGENCY, row.PATIENT].map((val, idx) => (
                      <td key={idx} className={`px-4 py-3 font-bold ${
                        val === "Manage"  ? "text-emerald-600" :
                        val === "View"    ? "text-blue-600"    :
                        val === "Monitor" ? "text-purple-600"  : "text-slate-300"
                      }`}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ── DB SCHEMA ── */}
      {activeTab === "schema" && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <Database className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[var(--ink)]">Database Schema Explorer</h2>
          <p className="mt-2 text-[var(--ink-2)]">
            Interactive viewer for all 18 core tables — columns, types, foreign keys, RLS policies, indexes and relationships.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["18 Tables","Multi-hospital SaaS","RBAC + RLS","HIPAA-ready","Audit Trail"].map(tag => (
              <span key={tag} className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-black text-[var(--primary)]">{tag}</span>
            ))}
          </div>
          <Link
            href="/super-admin/dashboard/schema"
            className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-black text-white">
            <Database className="h-5 w-5" /> Open Schema Explorer
          </Link>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === "analytics" && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Registered Patients", value: analytics?.totalPatients ?? 0 },
              { label: "Staff Members",        value: analytics?.totalStaff ?? 0 },
              { label: "Total Appointments",   value: analytics?.totalAppointments ?? 0 },
              { label: "Pending Approvals",    value: analytics?.pendingAppointments ?? 0 },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                <p className="mt-3 text-4xl font-black tabular-nums text-slate-950">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Invoices",  value: analytics?.totalInvoices ?? 0 },
              { label: "Unpaid Invoices", value: analytics?.unpaidInvoices ?? 0 },
              { label: "Revenue Collected", value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                <p className="mt-3 text-3xl font-black tabular-nums text-slate-950">{s.value}</p>
              </div>
            ))}
          </div>

          <Panel title="Appointments by Department" subtitle="Real-time breakdown">
            {analytics?.appointmentsByDept.length ? (
              <div className="grid gap-4">
                {analytics.appointmentsByDept.map(d => (
                  <div key={d.department} className="flex items-center gap-4">
                    <p className="w-52 shrink-0 truncate text-sm font-bold text-slate-700">{d.department}</p>
                    <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-4">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all"
                        style={{ width: `${(d.count / analytics.appointmentsByDept[0].count) * 100}%` }} />
                    </div>
                    <p className="w-10 text-right font-black text-slate-900">{d.count}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No appointments in the database yet.</p>
            )}
          </Panel>

          <Panel title="Staff by Role" subtitle="Current role distribution">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                users.reduce<Record<string, number>>((acc, u) => {
                  const key = ROLE_LABELS[u.role] ?? u.role;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <span className="font-bold text-slate-700">{role}</span>
                  <span className="text-2xl font-black text-slate-950">{count}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

    </DashboardShell>
  );
}
