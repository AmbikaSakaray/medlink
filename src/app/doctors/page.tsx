"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Loader2 } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { SectionHeading } from "@/components/public/SectionHeading";
import { GradientBlobs } from "@/components/public/GradientBlobs";
import { Tilt3D } from "@/components/public/Tilt3D";
import { createClient } from "@/lib/supabase/client";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

type Doctor = {
  id: string;
  full_name: string;
  department_name: string;
  qualification: string | null;
  experience_years: number;
  consultation_fee: number;
  is_available: boolean;
};

const specColors: Record<string, string> = {
  Cardiology: "#3b82f6", Neurology: "#a855f7", Orthopedics: "#f59e0b",
  Pediatrics: "#10b981", Emergency: "#ef4444", "General Medicine": "#059669",
  Gynecology: "#ec4899", Radiology: "#0ea5e9", Oncology: "#f472b6",
  Laboratory: "#6366f1", Pharmacy: "#14b8a6",
};

function getColor(dept: string) {
  for (const key of Object.keys(specColors)) {
    if (dept.toLowerCase().includes(key.toLowerCase())) return specColors[key];
  }
  return "#3b82f6";
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id,
          qualification,
          experience_years,
          consultation_fee,
          is_available,
          profiles:profile_id ( full_name ),
          departments:department_id ( name )
        `)
        .eq("is_available", true)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setDoctors(
          data.map((d: any) => {
            const prof = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
            const dept = Array.isArray(d.departments) ? d.departments[0] : d.departments;
            return {
              id: d.id,
              full_name: prof?.full_name ? `Dr. ${prof.full_name}` : "Doctor",
              department_name: dept?.name ?? "General Medicine",
              qualification: d.qualification,
              experience_years: d.experience_years ?? 0,
              consultation_fee: d.consultation_fee ?? 0,
              is_available: d.is_available,
            };
          })
        );
      }
      setLoading(false);
    }
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.department_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.qualification ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 sm:py-32">
        <div className="absolute inset-0 bg-foreground/5" />
        <GradientBlobs className="opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.span variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-primary"
          >
            👨‍⚕️ Our Specialists
          </motion.span>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            Meet Our <span className="text-gradient">Specialists</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Experienced, compassionate, and dedicated medical professionals ready to provide the best care.
          </motion.p>
        </div>
      </section>

      {/* Search bar */}
      <section className="border-y border-border bg-secondary/40 py-5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading doctors...</span>
              ) : (
                <><span className="font-bold text-foreground">{filtered.length}</span> specialists available</>
              )}
            </p>
            <div className="relative max-w-sm w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, department or qualification..."
                className="h-11 w-full rounded-xl border border-input bg-background/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground">Loading our specialists...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-5xl mb-4">{search ? "🔍" : "👨‍⚕️"}</p>
            <p className="font-display text-lg font-bold">
              {search ? "No doctors found" : "No doctors available right now"}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {search ? "Try a different search term" : "Please check back later or book an appointment"}
            </p>
            {search && (
              <button onClick={() => setSearch("")}
                className="mt-6 inline-flex rounded-2xl px-7 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((doc) => {
              const color = getColor(doc.department_name);
              const initials = doc.full_name
                .replace(/^Dr\.\s*/i, "")
                .split(" ").filter(Boolean).slice(0, 2)
                .map((p) => p[0]).join("").toUpperCase();
              return (
                <motion.div key={doc.id} variants={fadeUp}>
                  <Tilt3D className="h-full">
                    <div className="group flex h-full flex-col overflow-hidden rounded-3xl glass-card transition-all duration-300 hover:shadow-glow">
                      {/* Coloured header */}
                      <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg,${color}cc,${color}66)` }}>
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
                        <span className="absolute top-3 right-3 rounded-full bg-white/20 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          {doc.department_name}
                        </span>
                        {/* Availability dot */}
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Available
                        </span>
                      </div>

                      <div className="relative flex flex-1 flex-col px-7 pb-7">
                        {/* Avatar */}
                        <div
                          className="absolute -top-8 left-7 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card font-bold text-lg text-white shadow-lg"
                          style={{ background: `linear-gradient(135deg,${color},var(--color-mint))` }}
                        >
                          {initials}
                        </div>

                        <div className="mt-12">
                          <h3 className="font-display text-xl font-semibold">{doc.full_name}</h3>
                          <p className="mt-0.5 text-sm font-semibold" style={{ color }}>{doc.department_name}</p>
                          <div className="mt-5 space-y-2">
                            {doc.qualification && (
                              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>🎓</span>{doc.qualification}
                              </p>
                            )}
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>⭐</span>{doc.experience_years}+ Years Experience
                            </p>
                          </div>
                          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Consultation Fee</p>
                              <p className="mt-0.5 font-display text-lg font-bold">৳{doc.consultation_fee}</p>
                            </div>
                            <Link
                              href={`/appointment?doc=${doc.id}`}
                              className="rounded-2xl px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                            >
                              Book Visit
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tilt3D>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <PublicFooter />
    </>
  );
}
