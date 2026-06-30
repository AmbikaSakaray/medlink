"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Menu, X } from "lucide-react";
import { publicNavLinks } from "@/lib/constants";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 shadow-soft border border-white/20"
        style={{ background: "oklch(0.88 0.04 210 / 0.92)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Activity size={22} strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">Medilink</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Health Care
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {publicNavLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-primary/10 hover:text-primary",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop CTAs */}
          {pathname !== "/appointment" && (
            <>
              <Link
                href="/patient/login"
                className="hidden rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/patient/register"
                className="hidden rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
                style={{ background: "var(--gradient-primary)" }}
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/80 transition-colors hover:bg-primary/10 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-7xl rounded-2xl p-4 shadow-soft border border-white/20 lg:hidden"
            style={{ background: "oklch(0.88 0.04 210 / 0.97)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
          >
            <div className="flex flex-col gap-1">
              {publicNavLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
              {pathname !== "/appointment" && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/patient/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/patient/register"
                    onClick={() => setOpen(false)}
                    className="rounded-xl py-2.5 text-center text-sm font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}