"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, Send, MapPin, Phone, Mail } from "lucide-react";
import { hospitalInfo } from "@/lib/constants";

const columns = [
  {
    title: "Quick Links",
    links: [
      ["About Us", "/about"],
      ["Departments", "/departments"],
      ["Doctors", "/doctors"],
      ["Insurance", "/insurance"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Book Appointment", "/appointment"],
      ["Track Status", "/patient/track"],
      ["Telemedicine", "/telemedicine/dashboard"],
      ["Pharmacy", "/pharmacy"],
      ["Health Packages", "/#packages"],
    ],
  },
  {
    title: "Patient",
    links: [
      ["Patient Login", "/patient/login"],
      ["Register", "/patient/register"],
      ["Emergency", "/emergency"],
      ["Staff Login", "/login"],
    ],
  },
];

function IconFacebook() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function IconTwitter() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
}
function IconInstagram() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
}
function IconLinkedin() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
}

const socials = [
  { Icon: IconFacebook,  label: "Facebook",  href: "https://www.facebook.com/"  },
  { Icon: IconTwitter,   label: "Twitter",   href: "https://x.com/"   },
  { Icon: IconInstagram, label: "Instagram", href: "https://www.instagram.com/" },
  { Icon: IconLinkedin,  label: "LinkedIn",  href: "https://www.linkedin.com/"  },
];

export default function PublicFooter() {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-secondary/40">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                <Activity size={22} strokeWidth={2.4} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold text-foreground">Medilink</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Health Care
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {hospitalInfo.tagline}. Connecting patients with better care through one powerful digital healthcare ecosystem.
            </p>

            <div className="mt-5 flex gap-2">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="glass grid h-10 w-10 place-items-center rounded-xl text-foreground/70 transition-all hover:-translate-y-1 hover:text-primary"
                >
                  <Icon />
                </a>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["🏥 NABH", "🔒 HIPAA", "⭐ ISO"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border px-3 py-1 text-[10px] font-bold text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary hover:translate-x-0.5 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact + newsletter + map */}
        <div className="mt-12 grid gap-6 rounded-3xl glass-card p-6 sm:p-8 lg:grid-cols-[1fr_1fr_1.4fr]">
          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-muted-foreground">{hospitalInfo.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="shrink-0 text-primary" />
              <span className="text-muted-foreground">{hospitalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="shrink-0 text-destructive" />
              <span className="text-muted-foreground">
                Emergency: <span className="font-bold text-destructive">{hospitalInfo.emergency}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="shrink-0 text-primary" />
              <span className="text-muted-foreground">{hospitalInfo.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="shrink-0 text-mint" />
              <span className="text-muted-foreground">Support: <span className="font-semibold text-foreground">{hospitalInfo.support}</span></span>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">
              Subscribe to our newsletter
            </h4>
            {subbed ? (
              <p className="mt-3 text-sm font-semibold text-primary">
                ✓ Subscribed! Welcome to Medilink Health Care.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.trim())) return;
                  setSubbed(true);
                  setEmail("");
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground transition hover:opacity-90"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Google Maps embed */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-3">Our Location</h4>
            <div className="overflow-hidden rounded-2xl border border-border" style={{ height: "160px" }}>
              <iframe
                title="Medilink Health Care Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.271!2d90.376143!3d23.749737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhanmondi%2027%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {hospitalInfo.company}. All rights reserved.</p>
          <p>{hospitalInfo.website}</p>
        </div>
      </div>
    </footer>
  );
}
