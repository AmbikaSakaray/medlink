import { Activity } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl animate-pulse"
          style={{ background: "var(--gradient-primary)" }}>
          <Activity className="h-7 w-7 text-white" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
