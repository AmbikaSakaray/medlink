"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CheckCircle2, Quote } from "lucide-react";
import { Tilt3D } from "@/components/public/Tilt3D";
import { SectionHeading } from "@/components/public/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const highlights = [
  "Single connected healthcare ecosystem",
  "Patients, doctors, hospitals & pharmacies united",
  "Accessible and efficient digital care",
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="About Us"
          title="An Advanced Healthcare Technology Platform"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid items-center gap-10 lg:grid-cols-2"
        >
          {/* Left: image + director card */}
          <motion.div variants={fadeUp}>
            <Tilt3D intensity={8}>
              <div className="relative rounded-3xl glass-card p-3">
                {/* Dr. Arif Mahmud — founder portrait */}
                <Image
                  src="/director.jpg"
                  alt="Dr. Arif Mahmud — Founder & Managing Director"
                  width={900}
                  height={900}
                  className="w-full rounded-2xl object-cover object-top"
                  style={{ maxHeight: "420px" }}
                />
                {/* Name card overlay — bottom of portrait */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl px-5 py-4"
                  style={{
                    background: "oklch(0.93 0.03 210 / 0.97)",
                    backdropFilter: "blur(20px)",
                    border: "1.5px solid oklch(0.55 0.12 215 / 0.40)",
                    boxShadow: "0 8px 32px oklch(0.3 0.12 230 / 0.22)",
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-sm font-extrabold leading-tight" style={{ color: "oklch(0.15 0.07 248)" }}>Dr. Arif Mahmud</p>
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.40 0.10 215)" }}>Founder & Managing Director</p>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </motion.div>

          {/* Right: text — vertically centered with image */}
          <motion.div variants={fadeUp} className="flex flex-col justify-center pt-4">
            <Quote className="text-primary/40" size={40} />
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              Medilink Health Care is an advanced healthcare technology platform that seamlessly
              connects patients, doctors, hospitals, diagnostic centers, and pharmacies within a
              single digital ecosystem, promoting accessible and efficient healthcare services.
            </p>
            <ul className="mt-8 space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3">
                  <CheckCircle2 className="shrink-0 text-mint" size={22} />
                  <span className="font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
