"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Phone, Mail, Send } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { SectionHeading } from "@/components/public/SectionHeading";
import { GradientBlobs } from "@/components/public/GradientBlobs";
import { Tilt3D } from "@/components/public/Tilt3D";
import { hospitalInfo } from "@/lib/constants";
import { validateContactForm } from "@/lib/validate";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const contacts = [
  { Icon: Phone,  label: "Phone",     value: hospitalInfo.phone,     sub: "Mon–Sat, 8am–8pm"    },
  { Icon: Phone,  label: "Emergency", value: hospitalInfo.emergency, sub: "Available 24/7",      color: "text-destructive" },
  { Icon: Mail,   label: "Email",     value: hospitalInfo.email,     sub: "Response in 24hrs"    },
];

const inputCls = "h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition";

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateContactForm(form);
    if (validationError) { setError(validationError); return; }
    setLoading(true); setNotice(""); setError("");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to send message"); setLoading(false); return; }
    setNotice("Message sent! Our team will respond within 24 hours.");
    setForm({ full_name: "", email: "", phone: "", subject: "", message: "" });
    setLoading(false);
  }

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
            💬 Contact Us
          </motion.span>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            Get in <span className="text-gradient">Touch</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show"
            className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Our dedicated support team is ready to help. Send us a message or reach us directly — we respond within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="relative overflow-hidden py-14">
        <GradientBlobs className="opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}
            className="grid gap-12 lg:grid-cols-[1fr_420px]"
          >
            {/* Form */}
            <motion.div variants={fadeUp}>
              <SectionHeading eyebrow="Send a Message" title="Feedback" align="left" />
              <Tilt3D intensity={4} className="mt-8">
                <form onSubmit={submit} className="space-y-5 rounded-3xl glass-card p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input required placeholder="John Doe" className={inputCls}
                        value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                      <input required type="email" placeholder="you@example.com" className={inputCls}
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone (Optional)</label>
                      <input placeholder="+880 17XX XXXXXX" className={inputCls}
                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Subject</label>
                      <input required placeholder="How can we help?" className={inputCls}
                        value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message</label>
                    <textarea required rows={5} placeholder="Describe your inquiry in detail..."
                      className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">{error}</div>}
                  {notice && <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint">✓ {notice}</div>}
                  <button type="submit" disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                    <Send size={18} />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </Tilt3D>
            </motion.div>

            {/* Contact details + Map */}
            <motion.div variants={fadeUp} className="space-y-4 pt-2">
              <SectionHeading eyebrow="Contact Details" title="Reach us directly" align="left" />
              <div className="mt-8 space-y-4">
                {contacts.map((c) => (
                  <div key={c.label} className="flex items-start gap-4 rounded-2xl glass-card p-5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-primary-foreground"
                      style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                      <c.Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                      <p className={`mt-0.5 font-semibold text-sm ${c.color ?? "text-foreground"}`}>{c.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>


            </motion.div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
