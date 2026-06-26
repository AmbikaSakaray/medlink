import { notFound } from "next/navigation";
import Link from "next/link";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { getWorkflow, workflows } from "@/lib/workflows";
import { ArrowRight, ArrowLeft, CheckCircle2, FlaskConical, Users, Stethoscope } from "lucide-react";

export async function generateStaticParams() {
  return workflows.map(w => ({ slug: w.slug }));
}

export default async function DeptWorkflowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wf = getWorkflow(slug);
  if (!wf) notFound();

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className={`relative overflow-hidden bg-slate-950 px-6 py-20`}>
        <div className="pointer-events-none absolute inset-0 opacity-[.05]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className={`pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${wf.color}`} />
        <div className={`pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${wf.color}`} />

        <div className="relative mx-auto max-w-4xl">
          <Link href="/departments"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white/70 transition hover:bg-white/15">
            <ArrowLeft className="h-3 w-3" /> All Departments
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className={`inline-block rounded-full bg-gradient-to-r ${wf.color} px-4 py-1 text-xs font-black uppercase tracking-widest text-white`}>
                {wf.tagline}
              </span>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                {wf.name}
                <span className="block text-xl font-semibold text-slate-400 mt-1">Department Workflow</span>
              </h1>
              <p className="mt-4 max-w-xl text-slate-300">
                Complete step-by-step care pathway — from appointment booking through consultation, diagnostics, treatment, and follow-up.
              </p>
            </div>

            <Link
              href={`/appointment?dept=${encodeURIComponent(wf.bookDept)}`}
              className={`shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${wf.color} px-7 py-4 font-black text-white shadow-[0_8px_24px_rgba(0,0,0,.3)] transition hover:brightness-110`}
            >
              Book Appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

          {/* ── LEFT: Workflow Steps ── */}
          <div>
            <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-[var(--muted)]">
              Care Pathway — {wf.steps.length} Steps
            </h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-6 w-0.5 bg-slate-200"
                style={{ height: `calc(100% - 48px)` }} />

              <div className="grid gap-4">
                {wf.steps.map((step, idx) => (
                  <div key={idx}
                    className={`relative flex gap-5 rounded-[var(--radius)] border bg-white p-5 shadow-[var(--shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${wf.accentBorder}`}>

                    {/* Step bubble */}
                    <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${wf.color} shadow-[0_4px_12px_rgba(0,0,0,.15)] text-white`}>
                      <span className="text-xl leading-none">{step.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                        <h3 className="font-black text-[var(--ink)]">{step.title}</h3>
                        {step.role && (
                          <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${wf.accentBg} ${wf.accentText}`}>
                            {step.role}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">{step.desc}</p>
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-black text-white shadow">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="grid gap-6 lg:content-start">

            {/* Conditions */}
            <div className={`rounded-[var(--radius)] border ${wf.accentBorder} ${wf.accentBg} p-6`}>
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest ${wf.accentText}`}>
                <Stethoscope className="h-4 w-4" /> Conditions Treated
              </h3>
              <ul className="grid gap-2">
                {wf.conditions.map(c => (
                  <li key={c} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${wf.accentText}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specialists */}
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--muted)]">
                <Users className="h-4 w-4" /> Our Specialists
              </h3>
              <div className="flex flex-wrap gap-2">
                {wf.specialists.map(s => (
                  <span key={s}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${wf.accentBg} ${wf.accentText}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Diagnostic Tests */}
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--muted)]">
                <FlaskConical className="h-4 w-4" /> Diagnostic Tests
              </h3>
              <div className="flex flex-wrap gap-2">
                {wf.tests.map(t => (
                  <span key={t}
                    className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-bold text-[var(--ink-2)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className={`rounded-[var(--radius)] bg-gradient-to-br ${wf.color} p-6 text-white`}>
              <p className="text-lg font-black">Ready to get started?</p>
              <p className="mt-1 text-sm text-white/80">Book a {wf.name} appointment today. Our specialists are available 6 days a week.</p>
              <Link
                href={`/appointment?dept=${encodeURIComponent(wf.bookDept)}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/30"
              >
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/patient/journey"
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-5 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10">
                Track My Journey
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related Departments ── */}
        <div className="mt-16">
          <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-[var(--muted)]">
            Other Departments
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflows
              .filter(w => w.slug !== wf.slug)
              .slice(0, 4)
              .map(other => (
                <Link key={other.slug} href={`/departments/${other.slug}`}
                  className="group rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)]">
                  <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${other.color} p-2.5`}>
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-black text-[var(--ink)] group-hover:text-[var(--primary)]">{other.name}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">{other.tagline}</p>
                  <p className={`mt-3 flex items-center gap-1 text-xs font-black ${other.accentText}`}>
                    View Workflow <ArrowRight className="h-3 w-3" />
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
