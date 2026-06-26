"use client";

import { useEffect, useState } from "react";
import {
  FileText, CreditCard, Landmark, RotateCcw, BarChart3, CheckCircle, Loader2, Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/apiFetch";
import { DashboardShell, type TabItem } from "@/components/dashboard/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Panel } from "@/components/dashboard/Panel";
import { Info } from "@/components/dashboard/Info";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SuccessBanner } from "@/components/dashboard/SuccessBanner";
import PayButton from "@/components/payment/PayButton";
import HospitalBill from "@/components/payment/HospitalBill";

type Invoice = {
  id: string; invoice_code: string; patient_id: string | null; appointment_id: string | null;
  consultation_charge: number; lab_charge: number; medicine_charge: number;
  insurance_deduction: number; total: number; status: string; created_at: string;
  patient_name?: string;
};
type Payment = {
  id: string; invoice_id: string | null; amount: number; method: string;
  status: string; created_at: string; invoice_code?: string; patient_name?: string;
};
type Refund = {
  id: string; invoice_id: string | null; amount: number; reason: string;
  status: string; created_at: string; invoice_code?: string; patient_name?: string;
};

type Tab = "invoices" | "payments" | "settlements" | "refunds" | "revenue";

const tabs: TabItem[] = [
  { label: "Invoices",    value: "invoices",    icon: <FileText   className="h-[18px] w-[18px]" /> },
  { label: "Payments",   value: "payments",    icon: <CreditCard className="h-[18px] w-[18px]" /> },
  { label: "Settlements",value: "settlements", icon: <Landmark   className="h-[18px] w-[18px]" /> },
  { label: "Refunds",    value: "refunds",     icon: <RotateCcw  className="h-[18px] w-[18px]" /> },
  { label: "Revenue",    value: "revenue",     icon: <BarChart3  className="h-[18px] w-[18px]" /> },
];

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">{text}</p>;
}

export default function BillingDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("invoices");
  const [loading,   setLoading]   = useState(true);
  const [message,   setMessage]   = useState("");
  const [flashId,   setFlashId]   = useState<string | null>(null);
  const [busyId,    setBusyId]    = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [viewBill,  setViewBill]  = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds,  setRefunds]  = useState<Refund[]>([]);

  const [invForm, setInvForm] = useState({
    patient_name: "", patient_id: "", appointment_id: "",
    consultation_charge: "", lab_charge: "", medicine_charge: "", insurance_deduction: "",
  });

  async function loadData() {
    const [invRes, payRes] = await Promise.all([
      apiFetch("/api/billing/invoices").then(r => r.json()).catch(() => ({})),
      apiFetch("/api/billing/payments").then(r => r.json()).catch(() => ({})),
    ]);
    if (invRes.success) setInvoices(invRes.invoices ?? []);
    if (payRes.success) setPayments(payRes.payments ?? []);
    // Fetch refunds directly from Supabase
    try {
      const { data: refundData } = await createClient().from("refunds").select("*").order("created_at", { ascending: false });
      setRefunds(refundData ?? []);
    } catch { /* refunds table may not exist yet */ }
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: auth }) => {
      if (!auth.user) { window.location.href = "/billing/login"; return; }
      loadData();
    });
  }, []);

  function flash(id: string, msg: string) {
    setFlashId(id); setMessage(msg);
    setTimeout(() => setFlashId(null), 800);
  }

  async function generateInvoice(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/billing/generate", {
      method: "POST",
      body: JSON.stringify({
        patient_name:        invForm.patient_name || null,
        patient_id:          invForm.patient_id || null,
        appointment_id:      invForm.appointment_id || null,
        consultation_charge: Number(invForm.consultation_charge) || 0,
        lab_charge:          Number(invForm.lab_charge) || 0,
        medicine_charge:     Number(invForm.medicine_charge) || 0,
        insurance_deduction: Number(invForm.insurance_deduction) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) { setMessage(data.error ?? "Failed to generate invoice"); return; }
    setInvoices(prev => [data.invoice, ...prev]);
    setShowForm(false);
    setInvForm({ patient_name: "", patient_id: "", appointment_id: "", consultation_charge: "", lab_charge: "", medicine_charge: "", insurance_deduction: "" });
    flash(data.invoice.id, "Invoice generated successfully.");
  }

  // Called by PayButton onSuccess — uses API to mark paid and set appointment COMPLETED
  async function collectPayment(invoiceId: string) {
    setBusyId(invoiceId);
    const inv = invoices.find(i => i.id === invoiceId);
    const res = await apiFetch("/api/billing/pay", {
      method: "PATCH",
      body: JSON.stringify({ invoice_id: invoiceId, method: "razorpay", amount: inv?.total }),
    });
    const data = await res.json();
    if (data.success) {
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: "PAID" } : i));
      flash(invoiceId, "Payment collected — appointment marked complete.");
      await loadData(); // refresh payments list
    } else {
      setMessage(data.error ?? "Payment failed.");
    }
    setBusyId(null);
  }

  async function approveRefund(id: string) {
    setBusyId(id);
    const supabase = createClient();
    await supabase.from("refunds").update({ status: "COMPLETED" }).eq("id", id);
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: "COMPLETED" } : r));
    setBusyId(null);
    flash(id, "Refund approved and processed.");
  }

  const totalRevenue   = payments.reduce((s, p) => s + Number(p.amount), 0);
  const unpaidCount    = invoices.filter(i => i.status === "UNPAID").length;
  const paidCount      = invoices.filter(i => i.status === "PAID").length;
  const totalInsurance = invoices.reduce((s, i) => s + Number(i.insurance_deduction), 0);

  const revenueByDept = [
    { dept: "General Medicine", amount: 2450000, color: "bg-teal-500" },
    { dept: "Cardiology",       amount: 1890000, color: "bg-blue-500" },
    { dept: "Orthopedics",      amount: 1350000, color: "bg-indigo-500" },
    { dept: "Pediatrics",       amount:  980000, color: "bg-purple-500" },
    { dept: "Neurology",        amount:  760000, color: "bg-pink-500" },
    { dept: "Laboratory",       amount: 1020000, color: "bg-cyan-500" },
  ];
  const maxRevenue = Math.max(...revenueByDept.map(r => r.amount));

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <DashboardShell
      portalName="Billing Portal"
      portalSubtitle="Finance & Revenue Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={t => setActiveTab(t as Tab)}
      liveSummary={[
        { label: "Unpaid",    value: unpaidCount },
        { label: "Revenue",   value: `৳${totalRevenue.toLocaleString()}` },
        { label: "Insurance", value: `৳${totalInsurance.toLocaleString()}` },
        { label: "Refunds",   value: refunds.length },
      ]}
    >
      {message && <SuccessBanner message={message} onDismiss={() => setMessage("")} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue"  value={Math.round(totalRevenue)} icon={<BarChart3    className="h-5 w-5" />} />
        <MetricCard label="Paid Invoices"  value={paidCount}                icon={<CheckCircle  className="h-5 w-5" />} />
        <MetricCard label="Unpaid"         value={unpaidCount}              icon={<FileText     className="h-5 w-5" />} />
        <MetricCard label="Total Invoices" value={invoices.length}          icon={<CreditCard   className="h-5 w-5" />} />
      </div>

      <div key={activeTab} className="animate-fade-rise">

        {/* ── INVOICES ── */}
        {activeTab === "invoices" && (
          <div className="grid gap-6">
            <Panel
              title="Generate Invoice"
              subtitle="Create a new invoice for a patient"
              action={
                <button onClick={() => setShowForm(v => !v)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "New Invoice"}
                </button>
              }
            >
              {showForm ? (
                <form onSubmit={generateInvoice} className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Patient Name",             key: "patient_name",         placeholder: "Full name" },
                    { label: "Patient ID (UUID)",        key: "patient_id",           placeholder: "optional" },
                    { label: "Appointment ID",           key: "appointment_id",       placeholder: "optional" },
                    { label: "Consultation (BDT)",       key: "consultation_charge",  placeholder: "0" },
                    { label: "Lab Charge (BDT)",         key: "lab_charge",           placeholder: "0" },
                    { label: "Medicine Charge (BDT)",    key: "medicine_charge",      placeholder: "0" },
                    { label: "Insurance Deduction (BDT)",key: "insurance_deduction",  placeholder: "0" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</label>
                      <input
                        className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-500"
                        placeholder={placeholder}
                        value={invForm[key as keyof typeof invForm]}
                        onChange={e => setInvForm(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-sm text-slate-500">
                      Total = Consultation + Lab + Medicine − Insurance =&nbsp;
                      <strong>৳{Math.max(0,
                        (Number(invForm.consultation_charge) || 0) +
                        (Number(invForm.lab_charge) || 0) +
                        (Number(invForm.medicine_charge) || 0) -
                        (Number(invForm.insurance_deduction) || 0)
                      ).toLocaleString()}</strong>
                    </p>
                    <button type="submit"
                      className="rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 active:scale-[0.98]">
                      Generate Invoice
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-slate-400">Click &quot;New Invoice&quot; to create one.</p>
              )}
            </Panel>

            <Panel title="All Invoices" subtitle={`${invoices.length} total`}>
              <div className="grid gap-4">
                {invoices.map(inv => (
                  <div key={inv.id}
                    className={`rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition-colors duration-300 ${flashId === inv.id ? "bg-emerald-50" : ""}`}>
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{inv.invoice_code}</h3>
                        <p className="text-sm font-bold text-slate-500">
                          {inv.patient_name ?? "—"} • {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <Info label="Consultation" value={`৳${inv.consultation_charge}`} />
                      <Info label="Lab"          value={`৳${inv.lab_charge}`} />
                      <Info label="Medicine"     value={`৳${inv.medicine_charge}`} />
                      <Info label="Insurance"    value={`-৳${inv.insurance_deduction}`} />
                      <Info label="Total"        value={`৳${inv.total}`} />
                    </div>
                    {inv.status === "UNPAID" && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button onClick={() => setViewBill(inv)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition">
                          🧾 View Full Invoice
                        </button>
                        <PayButton
                          amount={inv.total}
                          invoiceCode={inv.invoice_code}
                          description={`Invoice ${inv.invoice_code}`}
                          prefill={{ name: inv.patient_name ?? undefined }}
                          label="Collect Payment"
                          onSuccess={() => collectPayment(inv.id)}
                          onFailure={(r) => setMessage(r.error)}
                        />
                      </div>
                    )}
                    {inv.status === "PAID" && (
                      <button onClick={() => setViewBill(inv)}
                        className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition">
                        🧾 View / Print Invoice
                      </button>
                    )}
                  </div>
                ))}
                {invoices.length === 0 && <Empty text="No invoices yet. Generate one above." />}
              </div>
            </Panel>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === "payments" && (
          <Panel title="Payment History" subtitle={`${payments.length} payments`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-left text-sm text-white">
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Patient</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(pay => (
                    <tr key={pay.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-teal-700">{pay.invoice_code ?? "—"}</td>
                      <td className="px-5 py-4 font-black text-slate-900">{pay.patient_name ?? "—"}</td>
                      <td className="px-5 py-4 font-black text-slate-900">৳{Number(pay.amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-600">{pay.method.toUpperCase()}</td>
                      <td className="px-5 py-4"><StatusBadge status={pay.status} /></td>
                      <td className="px-5 py-4 text-sm text-slate-500">{new Date(pay.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <Empty text="No payments recorded yet." />}
            </div>
          </Panel>
        )}

        {/* ── SETTLEMENTS ── */}
        {activeTab === "settlements" && (
          <Panel title="Insurance Settlements" subtitle="Insurance-deducted amounts vs patient-paid">
            <div className="grid gap-4">
              {invoices.filter(i => i.insurance_deduction > 0).map(inv => (
                <div key={inv.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-950">{inv.patient_name ?? "—"}</p>
                      <p className="text-sm font-bold text-slate-500">{inv.invoice_code}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-center">
                      <p className="text-xs font-bold text-blue-600">Total Bill</p>
                      <p className="font-black text-blue-700">৳{(inv.consultation_charge + inv.lab_charge + inv.medicine_charge).toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3 text-center">
                      <p className="text-xs font-bold text-emerald-600">Insurance Paid</p>
                      <p className="font-black text-emerald-700">৳{inv.insurance_deduction.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 text-center">
                      <p className="text-xs font-bold text-amber-600">Patient Pays</p>
                      <p className="font-black text-amber-700">৳{inv.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {invoices.filter(i => i.insurance_deduction > 0).length === 0 && (
                <Empty text="No insurance settlements found." />
              )}
            </div>
          </Panel>
        )}

        {/* ── REFUNDS ── */}
        {activeTab === "refunds" && (
          <Panel title="Refund Requests" subtitle={`${refunds.length} requests`}>
            <div className="grid gap-4">
              {refunds.map(ref => (
                <div key={ref.id}
                  className={`rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition-colors duration-300 ${flashId === ref.id ? "bg-emerald-50" : ""}`}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-black text-slate-950">{ref.patient_name ?? "—"}</h3>
                      <p className="text-sm font-bold text-slate-500">{ref.invoice_code ?? "—"} • ৳{Number(ref.amount).toLocaleString()}</p>
                      <p className="mt-2 text-sm text-slate-600">{ref.reason}</p>
                    </div>
                    <StatusBadge status={ref.status} />
                  </div>
                  {ref.status === "PENDING" && (
                    <button
                      disabled={busyId === ref.id}
                      onClick={() => approveRefund(ref.id)}
                      className="mt-4 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50">
                      {busyId === ref.id ? "Processing…" : "Approve Refund"}
                    </button>
                  )}
                </div>
              ))}
              {refunds.length === 0 && <Empty text="No refund requests." />}
            </div>
          </Panel>
        )}

        {/* ── REVENUE ── */}
        {activeTab === "revenue" && (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Cash Collected"    value={Math.round(totalRevenue)}   icon={<BarChart3  className="h-5 w-5" />} />
              <MetricCard label="Insurance Settled" value={Math.round(totalInsurance)} icon={<Landmark  className="h-5 w-5" />} />
              <MetricCard label="Unpaid Invoices"   value={unpaidCount}                icon={<CreditCard className="h-5 w-5" />} />
            </div>
            <Panel title="Revenue by Department" subtitle="Breakdown of revenue sources">
              <div className="grid gap-4">
                {revenueByDept.map(item => (
                  <div key={item.dept} className="flex items-center gap-4">
                    <p className="w-40 shrink-0 text-sm font-semibold text-[var(--ink)]">{item.dept}</p>
                    <div className="flex-1">
                      <div className="h-8 overflow-hidden rounded-full bg-[var(--line)]">
                        <div className={`h-full rounded-full ${item.color} transition-all duration-700`}
                          style={{ width: `${(item.amount / maxRevenue) * 100}%` }} />
                      </div>
                    </div>
                    <p className="w-28 text-right text-sm font-semibold text-[var(--ink-2)]">
                      ৳{(item.amount / 100000).toFixed(1)}L
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

      </div>

      {/* ── FULL HOSPITAL BILL MODAL ── */}
      {viewBill && (
        <HospitalBill
          invoiceCode={viewBill.invoice_code}
          invoiceDate={viewBill.created_at}
          patientName={viewBill.patient_name ?? ""}
          consultationCharge={viewBill.consultation_charge}
          labCharge={viewBill.lab_charge}
          medicineCharge={viewBill.medicine_charge}
          insuranceDeduction={viewBill.insurance_deduction}
          total={viewBill.total}
          status={viewBill.status}
          onClose={() => setViewBill(null)}
        />
      )}

    </DashboardShell>
  );
}
