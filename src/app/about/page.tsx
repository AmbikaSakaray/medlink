"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { CheckCircle2, Stethoscope, Award, UserRound, ShieldCheck } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { SectionHeading } from "@/components/public/SectionHeading";
import { GradientBlobs } from "@/components/public/GradientBlobs";
import { Tilt3D } from "@/components/public/Tilt3D";
import { hospitalInfo } from "@/lib/constants";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const values = [
  { Icon: Stethoscope, title: "Compassionate Care",  desc: "Every patient interaction is guided by empathy, dignity, and genuine concern for wellbeing.",        color: "text-cyan"       },
  { Icon: Award,       title: "Medical Excellence",  desc: "Evidence-based treatments, world-class specialists, and continuous quality improvement.",               color: "text-primary"    },
  { Icon: UserRound,   title: "Patient First",        desc: "Our digital systems and care pathways are designed entirely around the patient experience.",            color: "text-mint"       },
  { Icon: ShieldCheck, title: "Trust & Integrity",   desc: "Complete transparency and ethical practices in every clinical and administrative decision.",             color: "text-primary"    },
];

const milestones = [
  { year: "2023", event: "Medilink founded — digital health platform launched in Dhaka." },
  { year: "2023", event: "NABH accreditation achieved within 6 months of opening." },
  { year: "2024", event: "10,000 patients milestone. Telemedicine division launched." },
  { year: "2024", event: "Cardiology & Neurology Centers of Excellence established." },
  { year: "2025", event: "50,000 patients served. ISO 9001 certification awarded." },
  { year: "2026", event: "Expanding to 3 new cities. AI-assisted diagnostics pilot." },
];

const team = [
  { initials: "AK", name: "Dr. Arjun Kumar",  role: "Chief Medical Officer",    color: "#0ea5e9" },
  { initials: "SR", name: "Dr. Sneha Rao",    role: "Head of Neurology",        color: "#a855f7" },
  { initials: "PL", name: "Dr. Priya Lal",    role: "Head of Pediatrics",       color: "#f59e0b" },
  { initials: "NB", name: "Dr. Nadia Begum",  role: "Head of General Medicine", color: "#10b981" },
];

export default function AboutPage() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 sm:py-32">
        {/* No solid bg — global fixed background shows through */}
        <div className="absolute inset-0 bg-foreground/5" />
        <GradientBlobs className="opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.span
            variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-base font-bold tracking-wide text-primary"
          >
            🏥 About Us
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl"
          >
            About <span style={{ color: "oklch(0.12 0.07 248)" }}>{hospitalInfo.name}</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 text-lg leading-relaxed" style={{ color: "oklch(0.22 0.05 240)" }}
          >
            {hospitalInfo.tagline} since {hospitalInfo.founded}. Dedicated to world-class healthcare
            with compassion, innovation, and excellence.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
          className="grid items-center gap-14 lg:grid-cols-2"
        >
          <motion.div variants={fadeUp}>
            <Tilt3D intensity={8}>
              <div className="relative rounded-3xl glass-card p-3">
                <Image
                  src="https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&w=900"
                  alt="Medical team"
                  width={900} height={600}
                  className="h-[400px] w-full rounded-2xl object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 glass-card rounded-2xl px-5 py-4">
                  <p className="font-display text-sm font-bold">Est. {hospitalInfo.founded}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">NABH Accredited · {hospitalInfo.location}</p>
                </div>
              </div>
            </Tilt3D>
          </motion.div>

          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Our Mission" title="Healthcare that centres the patient." align="left" />
            <p className="mt-5 text-muted-foreground leading-8">
              Medilink was founded with one belief: healthcare should be accessible, transparent, and
              deeply human. By connecting every touchpoint — from booking to billing — we eliminate
              friction and let doctors and patients focus on what matters most.
            </p>
            <ul className="mt-6 space-y-3">
              {["Integrated booking, diagnostics & pharmacy", "Real-time updates & digital prescriptions", "Cashless insurance & instant billing"].map(h => (
                <li key={h} className="flex items-center gap-3">
                  <CheckCircle2 className="shrink-0 text-mint" size={20} />
                  <span className="font-medium text-sm">{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="inline-flex rounded-2xl px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                Book Appointment
              </Link>
              <Link href="/departments" className="glass inline-flex rounded-2xl px-6 py-3 text-sm font-semibold text-foreground transition hover:shadow-soft">
                Our Departments
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="relative py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Our Core Values" title="The principles we live by" />
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((v, i) => (
              <motion.div key={v.title} variants={fadeUp}>
                <Tilt3D className="h-full">
                  <div className="flex h-full flex-col rounded-3xl p-7 transition-all hover:shadow-glow hover:-translate-y-1" style={{ background: "oklch(0.88 0.04 210 / 0.85)", border: "1px solid oklch(1 0 0 / 0.35)", backdropFilter: "blur(20px)" }}>
                    <div className={`mb-5 grid h-12 w-12 place-items-center rounded-xl ${v.color}`} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                      <v.Icon size={24} strokeWidth={1.8} />
                    </div>
                    <h3 className={`font-display font-semibold ${v.color}`}>{v.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{v.desc}</p>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <SectionHeading eyebrow="Our Journey" title="Milestones" />
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
          className="relative mt-10 border-l-2 border-border pl-8 space-y-10"
        >
          {milestones.map((m, i) => (
            <motion.div key={i} variants={fadeUp} className="relative">
              <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="h-2 w-2 rounded-full bg-primary" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{m.year}</p>
              <p className="text-muted-foreground leading-6 font-medium">{m.event}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team */}
      <section className="relative py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Leadership" title="Our medical team" />
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {team.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Tilt3D className="h-full">
                  <div className="flex h-full flex-col items-center rounded-3xl p-7 text-center transition-all hover:shadow-glow hover:-translate-y-1" style={{ background: "oklch(0.88 0.04 210 / 0.85)", border: "1px solid oklch(1 0 0 / 0.35)", backdropFilter: "blur(20px)" }}>
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white mb-5"
                      style={{ background: `linear-gradient(135deg,${t.color},var(--color-mint))`, boxShadow: `0 8px 24px ${t.color}40` }}
                    >
                      {t.initials}
                    </div>
                    <h3 className="font-display font-semibold text-sm">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-14">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl glass-card p-12 text-center">
          <GradientBlobs className="opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">High Quality Healthcare</h2>
            <p className="mt-4 text-muted-foreground leading-7">Book an appointment with our specialists today.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/appointment" className="rounded-2xl px-8 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                Book Appointment
              </Link>
              <Link href="/contact" className="glass rounded-2xl px-8 py-3.5 text-sm font-semibold text-foreground transition hover:shadow-soft">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
