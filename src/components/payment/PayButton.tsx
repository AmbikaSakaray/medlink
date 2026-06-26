"use client";

import { useState } from "react";
import { initiatePayment, type PayOptions } from "@/lib/payment";

type Props = {
  amount: number;
  invoiceCode: string;
  description?: string;
  label?: string;
  className?: string;
  prefill?: PayOptions["prefill"];
  purpose?: PayOptions["purpose"];
  referenceId?: string;
  onSuccess: PayOptions["onSuccess"];
  onFailure?: PayOptions["onFailure"];
};

export default function PayButton({
  amount,
  invoiceCode,
  description = "Invoice payment",
  label,
  className = "",
  prefill,
  purpose,
  referenceId,
  onSuccess,
  onFailure,
}: Props) {
  const [busy, setBusy] = useState(false);

  const isMock = (process.env.NEXT_PUBLIC_PAYMENTS_MODE ?? "mock") !== "live";

  function handleClick() {
    setBusy(true);
    initiatePayment({
      amount,
      invoiceCode,
      description,
      prefill,
      purpose,
      referenceId,
      onSuccess: (r) => { setBusy(false); onSuccess(r); },
      onFailure: (r) => { setBusy(false); onFailure?.(r); },
    });
  }

  return (
    <button
      disabled={busy}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-black text-white shadow-sm hover:bg-emerald-500 active:scale-[0.97] disabled:opacity-50 transition ${className}`}
    >
      {busy ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Processing…
        </>
      ) : (
        <>
          {isMock && (
            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-900 uppercase tracking-wider">
              demo
            </span>
          )}
          {label ?? `Pay ৳${amount.toLocaleString()}`}
        </>
      )}
    </button>
  );
}
