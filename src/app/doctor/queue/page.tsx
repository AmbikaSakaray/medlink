"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LabReport = {
  id: string;
  result_summary: string | null;
  file_url: string | null;
  verified_at: string | null;
  test_type?: string;
};

type Appointment = {
  id: string;
  patient_id: string | null;
  appointment_code: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  department: string;
  preferred_date: string;
  preferred_time: string | null;
  symptoms: string | null;
  status: string;
  lab_required: boolean;
  lab_report_url: string | null;
  lab_reports: LabReport[];
  created_at: string;
};

type MedicineItem = {
  medicine_name: string;
  dosage: string;
  quantity: string;
  timing: string[];       // e.g. ["Morning", "Night"]
  relation: string;       // "Before food" | "After food" | "With food" | ""
  instructions: string;   // any extra free-text note
};

type Department = { id: string; name: string };
type PatientHistory = { appointments: unknown[]; prescriptions: unknown[]; lab_tests: unknown[]; medical_records: unknown[] };

type Tab = "queue" | "inprogress" | "completed";

const tabs: TabItem[] = [
  { label: "Patient Queue",   value: "queue",       icon: <Users         className="h-[18px] w-[18px]" /> },
  { label: "In Progress",     value: "inprogress",  icon: <Clock         className="h-[18px] w-[18px]" /> },
  { label: "Completed Today", value: "completed",   icon: <CheckCircle2  className="h-[18px] w-[18px]" /> },
];

const EMPTY_MED: MedicineItem = { medicine_name: "", dosage: "", quantity: "1", timing: [], relation: "", instructions: "" };

const TIMING_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];
const FOOD_RELATION = ["Before food", "After food", "With food"];

function buildInstructions(timing: string[], relation: string, extra: string): string {
  const parts: string[] = [];
  if (timing.length > 0) parts.push(timing.join(" & "));
  if (relation) parts.push(relation);
  if (extra.trim()) parts.push(extra.trim());
  return parts.join(" — ");
}

export default function DoctorQueuePage() {
  const [activeTab, setActiveTab]       = useState<Tab>("queue");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [department, setDepartment]     = useState<Department | null>(null);
  const [loading, setLoading]           = useState(true);
  const [message, setMessage]           = useState("");
  const [errorMsg, setErrorMsg]         = useState("");
  const [selected, setSelected]         = useState<Appointment | null>(null);
  const [actionId, setActionId]         = useState<string | null>(null);
  const [notes, setNotes]               = useState("");
  const [labRequired, setLabRequired]   = useState(false);
  const [medicines, setMedicines]       = useState<MedicineItem[]>([{ ...EMPTY_MED }]);
  const [labTestName, setLabTestName]     = useState("");
  const [history, setHistory]             = useState<PatientHistory | null>(null);
  const [historyPatient, setHistoryPatient] = useState<Appointment | null>(null);

  async function loadQueue() {
    setErrorMsg("");
    try {
      const res  = await apiFetch("/api/doctor/queue");
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Failed to load queue"); return; }
      setAppointments(data.appointments || []);
      setDepartment(data.department || null);
    } catch {
      setErrorMsg("Network error while loading queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    const { useRouter } = require("next/navigation");
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.replace("/doctor/login"); return; }
      loadQueue();
    });
  }, []);

  async function approveAppointment(id: string) {
    setActionId(id);
    const res = await apiFetch("/api/admin/appointments/approve", {
      method: "POST",
      body: JSON.stringify({ appointmentId: id }),
    });
    const data = await res.json();
    if (data.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
      setMessage("Appointment approved.");
    } else {
      setMessage(data.error ?? "Approval failed.");
    }
    setActionId(null);
  }

  async function rejectAppointment(id: string) {
    setActionId(id);
    const res = await apiFetch("/api/admin/appointments/reject", {
      method: "POST",
      body: JSON.stringify({ appointmentId: id }),
    });
    const data = await res.json();
    if (data.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED" } : a));
      setMessage("Appointment rejected.");
    } else {
      setMessage(data.error ?? "Reject failed.");
    }
    setActionId(null);
  }

  async function startConsultation(id: string) {
    setActionId(id);
    const res  = await apiFetch("/api/doctor/start-consultation", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || "Failed to start"); setActionId(null); return; }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "IN_PROGRESS" } : a));
    setMessage("Consultation started.");
    setActionId(null);
  }

  async function loadHistory(appt: Appointment) {
    if (!appt.patient_id) { setMessage("Patient history is not linked for this record."); return; }
    setHistoryPatient(appt);
    setHistory(null);
    const res = await apiFetch(`/api/doctor/patient-history?patient_id=${appt.patient_id}`);
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || "Unable to load history"); return; }
    setHistory(data.history);
  }

  async function submitPrescription(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const clean = medicines.filter(m => m.medicine_name.trim());
    if (!notes.trim() || clean.length === 0) {
      setMessage("Notes and at least one medicine are required.");
      return;
    }
    setActionId(selected.id);
    const res  = await apiFetch("/api/doctor/prescription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: selected.id, notes, labRequired: Boolean(labTestName.trim()), labTestName,
        medicines: clean.map(m => ({
          medicine_name: m.medicine_name,
          dosage:        m.dosage,
          quantity:      Number(m.quantity || 1),
          instructions:  buildInstructions(m.timing, m.relation, m.instructions),
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || "Failed to submit"); setActionId(null); return; }
    setSelected(null);
    setMedicines([{ ...EMPTY_MED }]);
    setNotes("");
    setLabRequired(false);
    setLabTestName("");
    await loadQueue();
    setMessage(labRequired ? "Prescription saved — patient sent to lab." : "Prescription saved — patient sent to pharmacy.");
    setActionId(null);
  }

  const queue      = appointments.filter(a => ["PENDING","APPROVED"].includes(a.status));
  const inProgress = appointments.filter(a => a.status === "IN_PROGRESS");
  const completed  = appointments.filter(a => !["PENDING","APPROVED","IN_PROGRESS"].includes(a.status));

  const tabData: Record<Tab, Appointment[]> = { queue, inprogress: inProgress, completed };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <DashboardShell
      portalName="Doctor"
      portalSubtitle={`Patient Queue${department ? ` — ${department.name}` : ""}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={t => setActiveTab(t as Tab)}
      liveSummary={[
        { label: "Queue",       value: queue.length },
        { label: "In Progress", value: inProgress.length },
        { label: "Completed",   value: completed.length },
        { label: "Total",       value: appointments.length },
      ]}
    >
      {message  && <SuccessBanner message={message}  onDismiss={() => setMessage("")}  />}
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <MetricCard label="Awaiting"    value={queue.length}       icon={<Users        className="h-5 w-5" />} />
        <MetricCard label="In Progress" value={inProgress.length}  icon={<Clock        className="h-5 w-5" />} />
        <MetricCard label="Completed"   value={completed.length}   icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Total"       value={appointments.length} icon={<Stethoscope className="h-5 w-5" />} />
      </div>

      <Panel
        title={activeTab === "queue" ? "Patient Queue" : activeTab === "inprogress" ? "In Progress" : "Completed Today"}
        subtitle={`${tabData[activeTab].length} appointments`}
      >
        {tabData[activeTab].length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-400">
            {activeTab === "queue" ? "No patients waiting. Queue is clear." :
             activeTab === "inprogress" ? "No consultations in progress." : "No completed appointments yet today."}
          </p>
        ) : (
          <div className="grid gap-4">
            {tabData[activeTab].map(a => (
              <div key={a.id} className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-lg font-black text-[var(--ink)]">{a.patient_name}</h3>
                    <p className="text-sm text-[var(--muted)]">{a.appointment_code} • {a.patient_phone}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Info label="Department" value={a.department} />
                  <Info label="Date"       value={formatBDDate(a.preferred_date)} />
                  <Info label="Time"       value={formatBDTime(a.preferred_time)} />
                  <Info label="Booked"     value={formatBDDate(a.created_at)} />
                </div>
                {a.symptoms && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-bold text-slate-500">Symptoms: </span>{a.symptoms}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => loadHistory(a)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-teal-400 hover:text-teal-700">
                    <FileText className="h-4 w-4" /> View History
                  </button>
                </div>
                {a.status === "PENDING" && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs font-bold text-amber-600">⏳ Pending — approve or reject this request:</p>
                    <div className="flex gap-2">
                      <button onClick={() => approveAppointment(a.id)} disabled={actionId === a.id}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-60">
                        {actionId === a.id ? "…" : "Approve"}
                      </button>
                      <button onClick={() => rejectAppointment(a.id)} disabled={actionId === a.id}
                        className="rounded-xl bg-red-600 px-5 py-2 text-sm font-black text-white hover:bg-red-500 disabled:opacity-60">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  {a.status === "APPROVED" && (
                    <button onClick={() => startConsultation(a.id)} disabled={actionId === a.id}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60">
                      {actionId === a.id ? "Starting…" : "Start Consultation"}
                    </button>
                  )}
                  {a.status === "IN_PROGRESS" && (
                    <button onClick={() => { setSelected(a); setNotes(""); setLabRequired(false); setLabTestName(""); setMedicines([{ ...EMPTY_MED }]); }}
                      className="rounded-xl bg-teal-700 px-5 py-2 text-sm font-black text-white hover:bg-teal-600">
                      Write Prescription
                    </button>
                  )}
                  {a.status === "LAB_COMPLETED" && a.lab_reports.length > 0 && (
                    <div className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-black text-blue-700">🧪 Lab Report Available</p>
                      {a.lab_reports.map((r, i) => (
                        <div key={i} className="mt-2">
                          <p className="text-xs font-semibold text-blue-600">{r.test_type}</p>
                          <p className="text-sm text-slate-700">{r.result_summary}</p>
                          {r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-700 underline">
                              Download Report ↗
                            </a>
                          )}
                        </div>
                      ))}
                      <button onClick={() => { setSelected(a); setNotes(""); setLabRequired(false); setLabTestName(""); setMedicines([{ ...EMPTY_MED }]); }}
                        className="mt-3 rounded-xl bg-teal-700 px-5 py-2 text-sm font-black text-white hover:bg-teal-600">
                        Write Prescription
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Prescription modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6">
          <form onSubmit={submitPrescription}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius)] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="text-xl font-black text-[var(--ink)]">Prescription — {selected.patient_name}</h2>
            <p className="text-sm text-[var(--muted)]">{selected.appointment_code}</p>

            <textarea required
              className="mt-4 min-h-28 w-full rounded-[var(--radius-sm)] border border-[var(--line)] p-3 text-sm outline-none focus:border-[var(--brand)]"
              placeholder="Diagnosis, clinical notes, advice..."
              value={notes} onChange={e => setNotes(e.target.value)} />

            <p className="mt-5 text-sm font-black uppercase tracking-widest text-[var(--muted)]">Medicines</p>
            <div className="mt-3 grid gap-3">
              {medicines.map((m, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
                  {/* Row 1: name + dosage + qty */}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      className="rounded-lg border border-[var(--line)] p-2.5 text-sm outline-none focus:border-teal-500"
                      placeholder="Medicine name" required
                      value={m.medicine_name}
                      onChange={e => setMedicines(prev => prev.map((p, j) => j === i ? { ...p, medicine_name: e.target.value } : p))}
                    />
                    <input
                      className="rounded-lg border border-[var(--line)] p-2.5 text-sm outline-none focus:border-teal-500"
                      placeholder="Dosage e.g. 500mg"
                      value={m.dosage}
                      onChange={e => setMedicines(prev => prev.map((p, j) => j === i ? { ...p, dosage: e.target.value } : p))}
                    />
                    <input type="number" min="1"
                      className="rounded-lg border border-[var(--line)] p-2.5 text-sm outline-none focus:border-teal-500"
                      placeholder="Qty"
                      value={m.quantity}
                      onChange={e => setMedicines(prev => prev.map((p, j) => j === i ? { ...p, quantity: e.target.value } : p))}
                    />
                  </div>

                  {/* Row 2: Timing checkboxes */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">When to take</p>
                    <div className="flex flex-wrap gap-2">
                      {TIMING_SLOTS.map(slot => {
                        const checked = m.timing.includes(slot);
                        return (
                          <button key={slot} type="button"
                            onClick={() => setMedicines(prev => prev.map((p, j) => j === i
                              ? { ...p, timing: checked ? p.timing.filter(t => t !== slot) : [...p.timing, slot] }
                              : p
                            ))}
                            className={`rounded-lg px-3 py-1.5 text-xs font-black transition border ${
                              checked
                                ? "bg-teal-600 text-white border-teal-600"
                                : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-700"
                            }`}>
                            {slot === "Morning" ? "🌅" : slot === "Afternoon" ? "☀️" : slot === "Evening" ? "🌆" : "🌙"} {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 3: Food relation */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Food relation</p>
                    <div className="flex flex-wrap gap-2">
                      {FOOD_RELATION.map(rel => (
                        <button key={rel} type="button"
                          onClick={() => setMedicines(prev => prev.map((p, j) => j === i
                            ? { ...p, relation: p.relation === rel ? "" : rel }
                            : p
                          ))}
                          className={`rounded-lg px-3 py-1.5 text-xs font-black transition border ${
                            m.relation === rel
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700"
                          }`}>
                          {rel === "Before food" ? "🍽️ Before food" : rel === "After food" ? "✅ After food" : "🥗 With food"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 4: Extra notes + remove */}
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 rounded-lg border border-[var(--line)] p-2.5 text-sm outline-none focus:border-teal-500"
                      placeholder="Additional instructions (optional)"
                      value={m.instructions}
                      onChange={e => setMedicines(prev => prev.map((p, j) => j === i ? { ...p, instructions: e.target.value } : p))}
                    />
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => setMedicines(prev => prev.filter((_, j) => j !== i))}
                        className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100">
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preview */}
                  {(m.timing.length > 0 || m.relation) && (
                    <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                      📋 {m.medicine_name || "This medicine"}: {buildInstructions(m.timing, m.relation, m.instructions)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setMedicines(prev => [...prev, { ...EMPTY_MED }])}
              className="mt-3 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--canvas)]">
              + Add Medicine
            </button>

            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3">
              <label className="text-sm font-bold text-blue-700">Lab test name optional</label>
              <input
                value={labTestName}
                onChange={e => setLabTestName(e.target.value)}
                placeholder="Example: CBC, ECG, MRI Brain"
                className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs font-semibold text-blue-600">Entering a test name sends this patient to the Lab Queue.</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button disabled={actionId === selected.id}
                className="flex-1 rounded-xl bg-teal-700 py-3 font-black text-white hover:bg-teal-600 disabled:opacity-60">
                {actionId === selected.id ? "Submitting…" : "Submit Prescription"}
              </button>
              <button type="button" onClick={() => setSelected(null)}
                className="flex-1 rounded-xl border border-[var(--line)] py-3 font-bold text-[var(--ink)] hover:bg-[var(--canvas)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {historyPatient && (
        <div className="fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[var(--radius)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--ink)]">Patient History — {historyPatient.patient_name}</h2>
                <p className="text-sm text-[var(--muted)]">{historyPatient.appointment_code}</p>
              </div>
              <button onClick={() => { setHistoryPatient(null); setHistory(null); }} className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-bold">Close</button>
            </div>
            {!history ? (
              <p className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">Loading history...</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <HistoryBox title="Appointments" count={history.appointments.length} />
                <HistoryBox title="Prescriptions" count={history.prescriptions.length} />
                <HistoryBox title="Lab Tests" count={history.lab_tests.length} />
                <HistoryBox title="Medical Records" count={history.medical_records.length} />
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}


function formatBDDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatBDTime(value: string | null) {
  if (!value) return "Any time";
  const normalized = value.includes("T") ? value : `1970-01-01T${value}`;
  return new Date(normalized).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Dhaka" });
}

function HistoryBox({ title, count }: { title: string; count: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-2 text-3xl font-black text-teal-700">{count}</p>
    </div>
  );
}
