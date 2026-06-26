"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type TabItem = { label: string; value: string; icon: ReactNode; badge?: number; };
export type LiveSummaryItem = { label: string; value: string | number; };

function Logo() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="flex items-center gap-2.5 text-left"
      aria-label="Refresh current portal page"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ background:"var(--grad-primary)", boxShadow:"0 4px 12px rgba(27,95,168,.35)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-3"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
      </div>
      <div className="leading-none">
        <p className="text-[13px] font-black tracking-widest text-[var(--ink)] uppercase">Medilink</p>
        <p className="text-[8px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">Health Care</p>
      </div>
    </button>
  );
}

export function DashboardShell({
  portalName, portalSubtitle, tabs, activeTab, onTabChange, liveSummary, headerExtra, children,
}: {
  portalName: string; portalSubtitle: string; tabs: TabItem[]; activeTab: string;
  onTabChange: (tab: string) => void; liveSummary?: LiveSummaryItem[]; headerExtra?: ReactNode; children: ReactNode;
}) {
  const [userName, setUserName]       = useState("...");
  const [userInitials, setUserInitials] = useState("--");
  const [userRole, setUserRole]       = useState("");
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("full_name, role").eq("id", data.user.id).single()
        .then(({ data: profile }) => {
          if (profile?.full_name) {
            setUserName(profile.full_name);
            const parts = profile.full_name.trim().split(" ");
            setUserInitials(parts.length >= 2 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : parts[0].slice(0,2).toUpperCase());
          } else {
            setUserName(data.user.email ?? "User");
            setUserInitials((data.user.email ?? "U").slice(0,2).toUpperCase());
          }
          if (profile?.role) setUserRole(profile.role.replace(/_/g," "));
        });
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Redirect to the login page for the current portal
    const path = window.location.pathname;
    if (path.startsWith("/patient"))      window.location.href = "/patient/login";
    else if (path.startsWith("/emergency"))    window.location.href = "/emergency/login";
    else if (path.startsWith("/doctor"))       window.location.href = "/doctor/login";
    else if (path.startsWith("/lab"))          window.location.href = "/lab/login";
    else if (path.startsWith("/pharmacy"))     window.location.href = "/pharmacy/login";
    else if (path.startsWith("/reception"))    window.location.href = "/reception/login";
    else if (path.startsWith("/billing"))      window.location.href = "/billing/login";
    else if (path.startsWith("/insurance"))    window.location.href = "/insurance/login";
    else if (path.startsWith("/telemedicine")) window.location.href = "/telemedicine/login";
    else window.location.href = "/login";
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <Logo />
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-[var(--muted)] hover:text-[var(--ink)]">
          <X className="h-5 w-5"/>
        </button>
      </div>

      {/* Portal badge */}
      <div className="px-5 py-3 border-b border-[var(--line)] bg-[var(--primary-soft)]">
        <p className="text-[9px] font-black uppercase tracking-[.18em] text-[var(--primary)]">{portalName}</p>
      </div>

      {/* Nav tabs */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {tabs.map(tab => {
          const isActive = activeTab === tab.value;
          return (
            <button key={tab.value} onClick={() => { onTabChange(tab.value); setMobileOpen(false); }}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold mb-0.5 transition-all duration-200 ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-[0_4px_14px_rgba(27,95,168,.35)]"
                  : "text-[var(--ink-2)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              }`}>
              <span className={`flex h-5 w-5 items-center justify-center transition-colors ${
                isActive ? "text-white" : "text-[var(--muted)] group-hover:text-[var(--primary)]"
              }`}>{tab.icon}</span>
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-white/25 text-white" : "bg-[var(--primary)] text-white"
                }`}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live summary */}
      {liveSummary && liveSummary.length > 0 && (
        <div className="border-t border-[var(--line)] px-5 py-4">
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-[var(--muted)] mb-3">Live Summary</p>
          <div className="space-y-2">
            {liveSummary.map(item => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-[var(--ink-2)]">{item.label}</span>
                <span className="font-black text-[var(--ink)] tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-[var(--line)] p-4">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100">
          <LogOut className="h-3.5 w-3.5"/> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)]">

      {/* Desktop sidebar */}
      <aside className="hidden w-[240px] shrink-0 border-r border-[var(--line)] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-white border-r border-[var(--line)] flex flex-col overflow-hidden shadow-[var(--shadow-lg)]">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--line)] bg-white px-4 lg:px-6 shadow-[0_1px_0_var(--line)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--ink-2)] lg:hidden">
              <Menu className="h-4 w-4"/>
            </button>
            <div>
              <h1 className="font-display text-base font-black text-[var(--ink)] leading-tight">{portalSubtitle}</h1>
              <p className="text-[10px] text-[var(--muted)] font-semibold">{portalName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--canvas)] transition">
              <Bell className="h-4 w-4"/>
            </button>
            <div className="h-5 w-px bg-[var(--line)] mx-1"/>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background:"var(--grad-primary)" }}>
                {userInitials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-[var(--ink)] leading-none">{userName}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{userRole || portalName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6 animate-fade-rise">
          {headerExtra && <div className="mb-5">{headerExtra}</div>}
          {children}
        </div>
      </main>
    </div>
  );
}
