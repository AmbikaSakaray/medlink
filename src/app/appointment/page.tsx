"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import StickyHelpBar from "@/components/public/StickyHelpBar";
import DatePicker from "@/components/public/DatePicker";
import TimeSelect from "@/components/public/TimeSelect";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { validateAppointmentForm } from "@/lib/validate";

type BookingSuccess = {
  patient_code: string;
  appointment_code: string;
  status: string;
};

export default function AppointmentPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "", age: "", phone: "", email: "",
    description: "", department: "",
    preferred_date: "", preferred_time: "", symptoms: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1. Auth gate — redirect to login if not a patient
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) {
        router.replace("/patient/login?next=/appointment");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", auth.user.id).single();
      if (!profile || profile.role !== "PATIENT") {
        router.replace("/patient/login?next=/appointment");
        return;
      }

      // 2. Pre-fill form from patient record
      const { data: patient } = await supabase
        .from("patients")
        .select("full_name, phone, age, email")
        .eq("profile_id", auth.user.id)
        .maybeSingle();

      if (patient) {
        setForm(f => ({
          ...f,
          full_name: patient.full_name ?? "",
          phone:     patient.phone     ?? "",
          age:       patient.age       ? String(patient.age) : "",
          email:     patient.email     ?? "",
        }));
      }

      setAuthChecked(true);
    });

    // 2b. Pre-fill department from ?dept= URL param
    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get("dept");
    if (deptParam) setForm(f => ({ ...f, department: deptParam }));

    // 3. Load departments from DB
    apiFetch("/api/admin/departments")
      .then(r => r.json())
      .then(data => {
        const active = (data.departments ?? [])
          .filter((d: { is_active: boolean }) => d.is_active)
          .map((d: { name: string }) => d.name);
        if (active.length > 0) setDepartments(active);
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateAppointmentForm(form);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const res  = await apiFetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Booking failed"); return; }
      setSuccess({
        patient_code:       data.patient.patient_code,
        appointment_code:   data.appointment.appointment_code,
        status:             data.appointment.status,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show spinner while auth check is in progress
  if (!authChecked) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-700">
            Book Appointment
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
            Request an Appointment
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Fill in the details below. Your Patient ID is already linked to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-3xl glass-card p-5 sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Patient Details</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Pre-filled from your profile — edit if needed.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
              placeholder="Patient Full Name" required
              value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <input className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
              placeholder="Age" type="number" min="1" required
              value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            <input className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
              placeholder="Mobile Number" required
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
              placeholder="Email" type="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <textarea
            className="mt-4 min-h-28 w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
            placeholder="Short description / patient concern"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <h2 className="mt-10 text-2xl font-black text-slate-950">Appointment Details</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <select required
              className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
              value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <DatePicker
              required
              value={form.preferred_date}
              onChange={v => setForm({ ...form, preferred_date: v, preferred_time: "" })
              }
              placeholder="Select appointment date"
            />
            <TimeSelect
              value={form.preferred_time}
              onChange={v => setForm({ ...form, preferred_time: v })}
              selectedDate={form.preferred_date}
            />
            <input disabled
              className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-slate-400 outline-none"
              placeholder="Doctor will be assigned by admin" />
          </div>

          <textarea
            className="mt-4 min-h-28 w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-teal-500"
            placeholder="Symptoms / Reason for appointment"
            value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />

          {error && (
            <p className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p>
          )}

          <button disabled={loading}
            className="mt-6 w-full rounded-2xl bg-teal-700 p-4 font-black text-white shadow-lg shadow-teal-700/20 hover:bg-teal-600 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Appointment Request"}
          </button>
        </form>
      </section>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-lg rounded-3xl glass-card p-6 sm:p-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700">
              ✓
            </div>
            <h2 className="text-center text-3xl font-black text-slate-950">Appointment Submitted</h2>
            <p className="mt-3 text-center font-bold text-slate-600">
              Your request has been sent to the admin for approval.
            </p>
            <div className="mt-6 space-y-3 rounded-3xl glass p-5">
              <p className="font-bold text-slate-700">
                Patient ID: <span className="font-black text-teal-700">{success.patient_code}</span>
              </p>
              <p className="font-bold text-slate-700">
                Appointment ID: <span className="font-black text-teal-700">{success.appointment_code}</span>
              </p>
              <p className="font-bold text-slate-700">
                Status: <span className="font-black text-yellow-700">{success.status}</span>
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link href={`/patient/journey?appt=${success.appointment_code}`}
                className="rounded-2xl bg-teal-700 p-4 text-center font-black text-white hover:bg-teal-600">
                View Journey
              </Link>
              <Link href="/patient/dashboard"
                className="rounded-2xl border border-teal-300 p-4 text-center font-black text-teal-700 hover:bg-teal-50">
                My Dashboard
              </Link>
              <Link href="/"
                className="rounded-2xl border border-slate-300 p-4 text-center font-black text-slate-700 hover:border-teal-500 hover:text-teal-700">
                Back Home
              </Link>
            </div>
            <button onClick={() => setSuccess(null)}
              className="mt-4 w-full rounded-2xl bg-slate-100 p-3 font-black text-slate-700 hover:bg-slate-200">
              Close
            </button>
          </div>
        </div>
      )}

      <PublicFooter />
      <StickyHelpBar />
    </main>
  );
}
