"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Upload,
  PackageCheck,
  Bell,
  Loader2,
} from "lucide-react";
import { usePharmacyCart } from "@/context/PharmacyCartContext";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    clearCart,
    cartCount,
    total,
  } = usePharmacyCart();

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [notes, setNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);

  if (!cartOpen) return null;

  async function saveMonthlyReminders() {
    if (!phone.trim()) {
      alert("Please enter phone number first.");
      return;
    }

    setSavingReminder(true);

    try {
      await Promise.all(
        cart.map((item) =>
          fetch("http://localhost:4000/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patient_phone: phone.trim(),
              medicine_id: item.id,
              medicine_name: item.name,
              frequency: "monthly",
              notes: `Monthly reorder reminder for ${item.name}`,
            }),
          })
        )
      );

      alert("Monthly reminders enabled successfully.");
      clearCart();
      setOrderPlaced(false);
      setCartOpen(false);
    } catch {
      alert("Failed to save reminders. Check backend server.");
    } finally {
      setSavingReminder(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex">
      <button
        aria-label="Close"
        onClick={() => setCartOpen(false)}
        className="flex-1 bg-black/20"
      />

      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <ShoppingCart size={20} />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold">Shopping Cart</h2>
              <p className="text-xs text-gray-500">
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCartOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {orderPlaced ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-5 grid h-20 w-20 place-items-center rounded-full text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PackageCheck size={40} />
            </div>

            <h2 className="font-display text-2xl font-extrabold text-foreground">
              Order Placed Successfully
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Would you like Medilink to remind you to purchase these medicines
              every month?
            </p>

            <div className="mt-8 grid w-full gap-3">
              <button
                onClick={saveMonthlyReminders}
                disabled={savingReminder}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}
              >
                {savingReminder ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Bell size={18} />
                )}
                {savingReminder ? "Saving..." : "Enable Monthly Reminder"}
              </button>

              <button
                onClick={() => {
                  clearCart();
                  setOrderPlaced(false);
                  setCartOpen(false);
                }}
                className="rounded-xl border border-border py-4 font-bold text-foreground hover:bg-gray-50"
              >
                Not Now
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-10">
                  <ShoppingCart size={52} className="text-primary" />
                  <h3 className="mt-5 text-xl font-bold">Your cart is empty</h3>
                  <p className="mt-2 text-center text-sm text-gray-500">
                    Add medicines from Pharmacy.
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-5">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center text-white"
                              style={{ background: "var(--gradient-primary)" }}
                            >
                              <PackageCheck size={26} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="mt-1 font-semibold text-primary">
                            ৳ {item.price}
                          </p>

                          {item.requires_prescription && (
                            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                              Prescription Required
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="flex items-center gap-2 rounded-xl border px-2 py-1">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-5 text-center font-semibold">
                              {item.qty}
                            </span>

                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t p-5">
                    <h3 className="font-bold">Order Details</h3>

                    <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/40 p-6">
                      <div className="text-center">
                        <Upload className="mx-auto text-primary" />
                        <p className="mt-2 text-sm font-semibold">
                          Upload Prescription
                        </p>
                      </div>
                      <input type="file" className="hidden" />
                    </label>

                    <input
                      className="mt-4 w-full rounded-xl border p-3"
                      placeholder="Patient Name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />

                    <input
                      className="mt-3 w-full rounded-xl border p-3"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDelivery("pickup")}
                        className={`rounded-xl border py-3 ${
                          delivery === "pickup"
                            ? "border-primary bg-primary text-white"
                            : ""
                        }`}
                      >
                        Pickup
                      </button>

                      <button
                        onClick={() => setDelivery("delivery")}
                        className={`rounded-xl border py-3 ${
                          delivery === "delivery"
                            ? "border-primary bg-primary text-white"
                            : ""
                        }`}
                      >
                        Delivery
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Notes"
                      className="mt-3 w-full rounded-xl border p-3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ৳ {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!patientName.trim() || !phone.trim()) {
                      alert("Please enter patient name and phone number.");
                      return;
                    }

                    setOrderPlaced(true);
                  }}
                  className="w-full rounded-xl py-4 font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Place Order
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}