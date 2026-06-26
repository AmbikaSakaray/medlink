"use client";

import { useEffect, useState } from "react";
import { Video, FileText, Pill, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/apiFetch";
import { DashboardShell, type TabItem } from "@/components/dashboard/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Panel } from "@/components/dashboard/Panel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SuccessBanner } from "@/components/dashboard/SuccessBanner";

type Session = {
  id: string; appointment_id: string | null; doctor_id: string | null; patient_id: string | null;
  scheduled_at: string; status: string; recording_url: string | null;
  doctor_name?: string; patient_name?: string;
};
type PrescriptionItem = { id: string; medicine_name: string; dosage: string | null; quantity: number; instructions: string | null };
type Prescription = {
  id: string; appointment_id: string | null; doctor_id: string | null; patient_id: string | null;
  prescription_notes: string | null; status: string; created_at: string;
  doctor_name?: string; patient_name?: string;
  items?: PrescriptionItem[];
};

type Tab = "sessions" | "recordings" | "prescriptions";

const tabs: TabItem[] = [
  { label: "Video Sessions",        value: "sessions",      icon: <Video    className="h-[18px] w-[18px]" /> },
  { label: "Recordings",            value: "recordings",    icon: <FileText className="h-[18px] w-[18px]" /> },
  { label: "Digital Prescriptions", value: "prescriptions", icon: <Pill     className="h-[18px] w-[18px]" /> },
];

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">{text}</p>;
}

export default function TelemedicineDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState("");
  const [flashId, setFlashId]     = useState<string | null>(null);
  const [busyId,  setBusyId]      = useState<string | null>(null);

  const [sessions,      setSessions]      = useState<Session[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) { window.location.href = "/telemedicine/login"; return; }

      const [sessRes, rxRes, itemsRes] = await Promise.all([
        supabase.from("telemedicine_sessions").select("*").order("scheduled_at", { ascending: false }),
        supabase.from("prescriptions").select("*").order("created_at", { ascending: false }).not("appointment_id", "is", null),
        supabase.from("prescription_items").select("*"),
      ]);

      setSessions(sessRes.data ?? []);

      const rxData = rxRes.data ?? [];
      const allItems = itemsRes.data ?? [];
      setPrescriptions(rxData.map((rx: Prescription) => ({
        ...rx,
        items: allItems.filter((i: PrescriptionItem & { prescription_id: string }) => i.prescription_id === rx.id),
      })));
      setLoading(false);
    });
  }, []);

  function flash(id: string, msg: string) {
    setFlashId(id);
    setMessage(msg);
    setTimeout(() => setFlashId(null), 800);
  }

  async function joinSession(id: string) {
    setBusyId(id);
    const res = await apiFetch("/api/telemedicine/update-status", {
      method: "PATCH",
      body: JSON.stringify({ session_id: id, status: "ONGOING" }),
    });
    const { error } = await res.json().then(d => ({ error: d.success ? null : d.error }));
    if (error) { setMessage("Failed to start session."); setBusyId(null); return; }
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "ongoing" } : s));
    setBusyId(null);
    flash(id, "Session started. Joining video room…");
  }

  async function endSession(id: string) {
    setBusyId(id);
    const res = await apiFetch("/api/telemedicine/update-status", {
      method: "PATCH",
      body: JSON.stringify({ session_id: id, status: "COMPLETED" }),
    });
    const { error } = await res.json().then(d => ({ error: d.success ? null : d.error }));
    if (error) { setMessage("Failed to end session."); setBusyId(null); return; }
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "completed" } : s));
    setBusyId(null);
    flash(id, "Session ended. Recording saved.");
  }

  const scheduled = sessions.filter(s => s.status === "scheduled" || s.status === "SCHEDULED").length;
  const ongoing   = sessions.filter(s => s.status === "ongoing"   || s.status === "ONGOING").length;
  const completed = sessions.filter(s => s.status === "completed" || s.status === "COMPLETED").length;

  const recordings = sessions.filter(s =>
    (s.status === "completed" || s.status === "COMPLETED") && s.recording_url
  );

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <DashboardShell
      portalName="Telemedicine"
      portalSubtitle="Virtual Consultation Platform"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={t => setActiveTab(t as Tab)}
      liveSummary={[
        { label: "Ongoing Now",     value: ongoing },
        { label: "Scheduled Today", value: scheduled },
        { label: "Completed",       value: completed },
      ]}
    >
      {message && <SuccessBanner message={message} onDismiss={() => setMessage("")} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Ongoing"   value={ongoing}   icon={<Video    className="h-5 w-5" />} />
        <MetricCard label="Scheduled" value={scheduled} icon={<FileText className="h-5 w-5" />} />
        <MetricCard label="Completed" value={completed} icon={<Pill     className="h-5 w-5" />} />
      </div>

      <div key={activeTab} className="animate-fade-rise">

        {/* ── SESSIONS ── */}
        {activeTab === "sessions" && (
          <Panel title="Video Consultations" subtitle={`${sessions.length} total`}>
            <div className="grid gap-4">
              {sessions.map(s => {
                const isScheduled = s.status === "scheduled" || s.status === "SCHEDULED";
                const isOngoing   = s.status === "ongoing"   || s.status === "ONGOING";
                return (
                  <div key={s.id}
                    className={`rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition-colors duration-300 ${flashId === s.id ? "bg-blue-50" : ""}`}>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{s.patient_name ?? "—"}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {s.doctor_name ?? "—"} • {new Date(s.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-4 flex gap-3">
                      {isScheduled && (
                        <button
                          disabled={busyId === s.id}
                          onClick={() => joinSession(s.id)}
                          className="rounded-2xl bg-blue-600 px-6 py-3 font-black text-white hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50">
                          {busyId === s.id ? "Starting…" : "Join Room"}
                        </button>
                      )}
                      {isOngoing && (
                        <button
                          disabled={busyId === s.id}
                          onClick={() => endSession(s.id)}
                          className="rounded-2xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-500 active:scale-[0.98] disabled:opacity-50">
                          {busyId === s.id ? "Ending…" : "End Session"}
                        </button>
                      )}
                      {s.recording_url && (
                        <a href={s.recording_url} target="_blank" rel="noopener noreferrer"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-600 hover:bg-slate-100">
                          View Recording
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {sessions.length === 0 && <Empty text="No sessions found." />}
            </div>
          </Panel>
        )}

        {/* ── RECORDINGS ── */}
        {activeTab === "recordings" && (
          <Panel title="Session Recordings" subtitle={`${recordings.length} recordings`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {recordings.map(s => (
                <div key={s.id}
                  className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-5xl">▶️</div>
                  <div className="p-5">
                    <h3 className="font-black text-slate-950">{s.patient_name ?? "—"}</h3>
                    <p className="text-sm font-bold text-slate-500">{s.doctor_name ?? "—"}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-400">{new Date(s.scheduled_at).toLocaleDateString()}</p>
                      <a href={s.recording_url!} target="_blank" rel="noopener noreferrer"
                        className="rounded-xl border border-teal-200 px-3 py-1 text-sm font-black text-teal-700 hover:bg-teal-50">
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {recordings.length === 0 && <Empty text="No recordings yet. They appear here once sessions are completed." />}
            </div>
          </Panel>
        )}

        {/* ── DIGITAL PRESCRIPTIONS ── */}
        {activeTab === "prescriptions" && (
          <Panel title="Digital Prescriptions" subtitle={`${prescriptions.length} e-prescriptions`}>
            <div className="grid gap-4">
              {prescriptions.map(rx => (
                <div key={rx.id}
                  className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">{rx.patient_name ?? "—"}</h3>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {rx.doctor_name ?? "—"} • {new Date(rx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={rx.status} />
                  </div>
                  {rx.prescription_notes && (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{rx.prescription_notes}</p>
                  )}
                  {rx.items && rx.items.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Medicines</p>
                      <div className="mt-2 grid gap-2">
                        {rx.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div>
                              <p className="font-black text-slate-950">{item.medicine_name}</p>
                              <p className="text-sm text-slate-500">{item.instructions ?? "—"}</p>
                            </div>
                            <p className="font-bold text-teal-700">{item.dosage} × {item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {prescriptions.length === 0 && <Empty text="No digital prescriptions yet." />}
            </div>
          </Panel>
        )}

      </div>
    </DashboardShell>
  );
}
