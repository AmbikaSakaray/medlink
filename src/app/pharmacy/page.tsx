"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import PayButton from "@/components/payment/PayButton";
import {
  ShoppingCart, Search, Plus, Minus, X, Pill, Truck, ShieldCheck,
  Clock, PackageCheck, AlertCircle, Loader2, Upload, FileText, CheckCircle2,
} from "lucide-react";

type Medicine = {
  id: string; name: string; description: string | null; category: string;
  price: number; quantity: number; image_url: string | null;
  requires_prescription: boolean; is_available: boolean;
};
type CartItem = Medicine & { qty: number };
type OrderForm = {
  patient_name: string; patient_phone: string;
  delivery_type: "pickup" | "home_delivery"; notes: string;
};

const FALLBACK: Medicine[] = [
  { id:"f-1",  name:"Paracetamol 500mg",       description:"Fever & mild pain relief",          category:"Pain Relief",  price:3,   quantity:500, image_url:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-2",  name:"Amoxicillin 500mg",        description:"Broad-spectrum antibiotic",         category:"Antibiotics",  price:8,   quantity:200, image_url:"https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-3",  name:"Cetirizine 10mg",          description:"Antihistamine for allergies",       category:"Allergy",      price:4,   quantity:350, image_url:"https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-4",  name:"Omeprazole 20mg",          description:"Acid reflux & stomach ulcers",      category:"Gastro",       price:10,  quantity:180, image_url:"https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-5",  name:"Metformin 500mg",          description:"Type 2 diabetes management",        category:"Diabetes",     price:6,   quantity:45,  image_url:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-6",  name:"Enalapril 10mg",           description:"ACE inhibitor for hypertension",    category:"Cardiology",   price:12,  quantity:80,  image_url:"https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-7",  name:"Salbutamol Inhaler",       description:"Relieves bronchospasm in asthma",   category:"Respiratory",  price:180, quantity:35,  image_url:"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-8",  name:"Vitamin C 500mg",          description:"Immune support supplement",         category:"Supplements",  price:5,   quantity:600, image_url:"https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-9",  name:"Ferrous Sulfate 325mg",    description:"Iron deficiency anaemia",           category:"Supplements",  price:5,   quantity:450, image_url:"https://images.unsplash.com/photo-1555633514-abcee6ab92e1?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-10", name:"Glimepiride 2mg",          description:"Oral hypoglycaemic agent",          category:"Diabetes",     price:15,  quantity:90,  image_url:"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-11", name:"Dextromethorphan Syrup",   description:"Cough suppressant",                 category:"Respiratory",  price:65,  quantity:12,  image_url:"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-12", name:"Montelukast 5mg",          description:"Asthma & allergic rhinitis",        category:"Respiratory",  price:22,  quantity:120, image_url:"https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-13", name:"Azithromycin 500mg",       description:"Macrolide antibiotic",              category:"Antibiotics",  price:9,   quantity:150, image_url:"https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-14", name:"Ibuprofen 400mg",          description:"Anti-inflammatory pain relief",     category:"Pain Relief",  price:4,   quantity:300, image_url:"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-15", name:"Metronidazole 400mg",      description:"Antibacterial & antiprotozoal",     category:"Antibiotics",  price:5,   quantity:180, image_url:"https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop&q=80",  requires_prescription:true,  is_available:true },
  { id:"f-16", name:"Loratadine 10mg",          description:"Non-drowsy allergy relief",         category:"Allergy",      price:6,   quantity:250, image_url:"https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-17", name:"Aspirin 75mg",             description:"Blood thinner & mild pain relief",  category:"Cardiology",   price:3,   quantity:400, image_url:"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
  { id:"f-18", name:"Pantoprazole 40mg",        description:"Proton pump inhibitor",             category:"Gastro",       price:8,   quantity:200, image_url:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&q=80",  requires_prescription:false, is_available:true },
];

function catColor(cat: string) {
  const m: Record<string, string> = {
    "Pain Relief":"bg-rose-100/60 text-rose-800 border-rose-300",
    Antibiotics:"bg-amber-100/60 text-amber-800 border-amber-300",
    Allergy:"bg-green-100/60 text-green-800 border-green-300",
    Gastro:"bg-purple-100/60 text-purple-800 border-purple-300",
    Diabetes:"bg-red-100/60 text-red-800 border-red-300",
    Cardiology:"bg-blue-100/60 text-blue-800 border-blue-300",
    Respiratory:"bg-sky-100/60 text-sky-800 border-sky-300",
    Supplements:"bg-yellow-100/60 text-yellow-800 border-yellow-300",
  };
  return m[cat] ?? "bg-teal-100/60 text-teal-800 border-teal-300";
}

function CartSidebar({ cart, onClose, onChange, onRemove }: {
  cart: CartItem[]; onClose: () => void;
  onChange: (id: string, qty: number) => void; onRemove: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<OrderForm>({ patient_name:"", patient_phone:"", delivery_type:"pickup", notes:"" });
  const [rxFile, setRxFile] = useState<File | null>(null);
  const [rxPreview, setRxPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);
  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasRx = cart.some(i => i.requires_prescription);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRxFile(file);
    const reader = new FileReader();
    reader.onload = ev => setRxPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (hasRx && !rxFile) { setErr("Please upload your prescription for Rx medicines."); return; }
    setLoading(true); setErr("");
    let prescriptionData: string | null = null;
    if (rxFile) {
      prescriptionData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target?.result as string);
        reader.readAsDataURL(rxFile);
      });
    }
    try {
      const res = await fetch("/api/pharmacy/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prescription_image: prescriptionData, items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })) }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error || "Failed to place order"); return; }
      setPlacedOrder({ id: json.order.id, total: json.order.total });
    } catch { setErr("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full rounded-xl glass border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  if (paid) return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-8" style={{ background: "var(--gradient-soft)" }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
          <PackageCheck className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-display font-extrabold text-foreground text-center">Payment Confirmed!</h2>
        <p className="text-center text-muted-foreground">Your order has been placed. Our pharmacy team will process it shortly.</p>
        <button onClick={onClose} className="rounded-2xl w-full py-3.5 font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>Done</button>
      </div>
    </div>
  );

  if (placedOrder) return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-8" style={{ background: "var(--gradient-soft)" }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
          <PackageCheck className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-display font-extrabold text-foreground text-center">Order Placed!</h2>
        <p className="text-center text-muted-foreground">Complete payment to confirm your order.</p>
        <PayButton amount={placedOrder.total} invoiceCode={`PHARM-${placedOrder.id}`} purpose="pharmacy_order" referenceId={placedOrder.id} description="Pharmacy order payment" onSuccess={() => setPaid(true)} onFailure={(r) => setErr(r.error)} />
        {err && <p className="text-sm text-red-500 text-center">{err}</p>}
        <button onClick={onClose} className="text-sm text-muted-foreground hover:underline">Skip — pay at counter</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="flex h-full w-full max-w-md flex-col" style={{ background: "var(--gradient-soft)" }}>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><ShoppingCart className="h-5 w-5" /></div>
            <div>
              <h2 className="font-display font-bold text-foreground">Your Cart</h2>
              <p className="text-xs text-muted-foreground">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-foreground/10"><X className="h-5 w-5 text-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border px-6">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Pill className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{item.name}</p>
                  {item.requires_prescription && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700"><FileText className="h-3 w-3" /> Rx Required</span>}
                  <p className="mt-0.5 font-bold text-primary">৳{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => onRemove(item.id)} className="rounded-lg p-1 text-muted-foreground hover:text-red-500"><X className="h-4 w-4" /></button>
                  <div className="flex items-center gap-2 rounded-xl glass border border-border px-2 py-1">
                    <button onClick={() => onChange(item.id, item.qty - 1)} className="rounded-lg p-0.5 hover:bg-foreground/10"><Minus className="h-3.5 w-3.5 text-foreground" /></button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">{item.qty}</span>
                    <button onClick={() => onChange(item.id, item.qty + 1)} className="rounded-lg p-0.5 hover:bg-foreground/10"><Plus className="h-3.5 w-3.5 text-foreground" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form id="order-form" onSubmit={placeOrder} className="space-y-5 border-t border-border px-6 py-5">
            <h3 className="font-display font-bold text-foreground">Order Details</h3>
            {err && <div className="flex gap-2 rounded-xl glass border border-red-300 px-4 py-3"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" /><p className="text-sm text-red-600">{err}</p></div>}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" /> Prescription {hasRx && <span className="text-red-500">*</span>}
                </label>
                {rxFile && <button type="button" onClick={() => { setRxFile(null); setRxPreview(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs font-bold text-red-500 hover:underline">Remove</button>}
              </div>
              {rxPreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rxPreview} alt="Prescription preview" className="w-full h-40 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
                    <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                    <p className="text-xs font-bold text-white truncate">{rxFile?.name}</p>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl glass border-2 border-dashed border-primary/40 px-4 py-6 transition hover:border-primary">
                  <Upload className="h-6 w-6 text-primary" />
                  <p className="text-sm font-bold text-foreground">Upload Prescription</p>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Your Name *</label><input className={inputCls} required value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Full name" /></div>
            <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Phone Number</label><input className={inputCls} type="tel" value={form.patient_phone} onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))} placeholder="+880 1xxx xxxxxx" /></div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery</label>
              <div className="grid grid-cols-2 gap-2">
                {(["pickup","home_delivery"] as const).map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, delivery_type: type }))}
                    className={`rounded-xl border-2 py-2.5 text-sm font-bold transition ${form.delivery_type === type ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    style={form.delivery_type === type ? { background: "var(--primary)/10" } : {}}>
                    {type === "pickup" ? "🏥 Pickup" : "🚚 Delivery"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Notes</label><textarea className={inputCls + " resize-none"} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions…" /></div>
          </form>
        </div>

        <div className="border-t border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-2xl font-display font-extrabold text-primary">৳{total.toFixed(2)}</span>
          </div>
          <button form="order-form" type="submit" disabled={loading || cart.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PackageCheck className="h-5 w-5" />}
            {loading ? "Placing Order…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicineCard({ med, onAdd }: { med: Medicine; onAdd: (m: Medicine) => void }) {
  const inStock = med.quantity > 0;
  const [imgError, setImgError] = useState(false);
  return (
    <div className="group flex flex-col rounded-3xl glass-card transition duration-200 hover:-translate-y-1 hover:shadow-glow overflow-hidden">
      <div className="h-44 overflow-hidden relative" style={{ background: "var(--gradient-soft)" }}>
        {med.image_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={med.image_url} alt={med.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2" style={{ background: "var(--gradient-hero)" }}>
            <Pill size={40} className="text-white/80" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{med.category}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{med.name}</h3>
          {med.requires_prescription && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100/80 border border-amber-300">Rx</span>}
        </div>
        {med.description && <p className="text-xs leading-5 text-muted-foreground">{med.description}</p>}
        <span className={`self-start rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${catColor(med.category)}`}>{med.category}</span>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="font-display text-xl font-extrabold text-primary">৳{med.price}</p>
            <p className={`text-xs font-semibold ${inStock ? "text-mint" : "text-red-500"}`}>{inStock ? `${med.quantity} in stock` : "Out of stock"}</p>
          </div>
          <button disabled={!inStock} onClick={() => onAdd(med)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/pharmacy/medicines")
      .then(r => r.json())
      .then(json => setMedicines(json.success && json.medicines.length > 0 ? json.medicines : FALLBACK))
      .catch(() => setMedicines(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...new Set(medicines.map(m => m.category))], [medicines]);
  const filtered = useMemo(() => medicines.filter(m => {
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [medicines, search, activeCategory]);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addToCart(med: Medicine) {
    setCart(prev => {
      const ex = prev.find(i => i.id === med.id);
      return ex ? prev.map(i => i.id === med.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...med, qty: 1 }];
    });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(`✓ ${med.name} added to cart`);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }
  function updateQty(id: string, qty: number) { if (qty < 1) removeFromCart(id); else setCart(p => p.map(i => i.id === id ? { ...i, qty } : i)); }
  function removeFromCart(id: string) { setCart(p => p.filter(i => i.id !== id)); }
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Sticky cart bar — visible on scroll */}
      {/* Sticky cart bar — always visible below navbar when cart has items */}
      <div
        className="fixed left-0 right-0 z-40 flex items-center justify-between px-6 py-2.5 shadow-lg transition-all duration-300"
        style={{
          top: "72px",
          background: "var(--gradient-primary)",
          transform: cartCount > 0 ? "translateY(0)" : "translateY(-120%)",
          opacity: cartCount > 0 ? 1 : 0,
          pointerEvents: cartCount > 0 ? "auto" : "none",
        }}
      >
        <span className="font-bold text-white text-sm">
          🛒 {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </span>
        <button
          onClick={() => setCartOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-white/30"
        >
          <ShoppingCart className="h-4 w-4" /> View Cart
        </button>
      </div>

      {/* Hero + integrated search & filters */}
      <section className="relative overflow-hidden pt-24 pb-0 sm:pt-28">
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-base font-bold tracking-wide text-primary">
            <Pill className="h-4 w-4 text-primary" /> Medilink Pharmacy
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Trusted{" "}
            <span style={{ color: "oklch(0.12 0.08 248)" }}>Online Pharmacy</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed" style={{ color: "oklch(0.20 0.05 240)" }}>
            Real medicines. Fast delivery. Zero hassle — browse our full catalogue, upload your prescription and get it delivered or picked up same day.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-5">
            {[
              { icon: ShieldCheck, label: "100% Genuine Medicines" },
              { icon: Clock, label: "Same-Day Pickup" },
              { icon: Truck, label: "Home Delivery Available" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Icon className="h-4 w-4 text-primary" />{label}
              </div>
            ))}
          </div>

          {/* Search + cart merged into hero bottom */}
          <div className="mt-6 flex items-center gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKey} placeholder="Search medicines…"
                className="w-full rounded-2xl glass border border-border py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft" />
            </div>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 shrink-0"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
              <ShoppingCart className="h-4 w-4" /> Cart
              {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{cartCount}</span>}
            </button>
          </div>

          {/* Category pills — wrap to fill width, no scrollbar */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-2xl mx-auto pb-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeCategory === cat ? "text-primary-foreground" : "glass border border-border text-foreground hover:border-primary/50"}`}
                style={activeCategory === cat ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" } : {}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main ref={resultsRef} className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: cartCount > 0 ? "7rem" : "1.5rem" }}>
        <div className="mb-8 flex items-center gap-4 rounded-2xl glass-card px-6 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">Have a doctor&apos;s prescription?</p>
            <p className="text-sm text-muted-foreground">Add medicines to your cart — you can upload the prescription at checkout.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground">Loading medicines…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl glass-card text-primary"><Pill size={40} /></div>
            <p className="font-display text-xl font-bold text-foreground">No medicines found</p>
            <p className="text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-bold text-muted-foreground">{filtered.length} medicine{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(med => <MedicineCard key={med.id} med={med} onAdd={addToCart} />)}
            </div>
          </>
        )}
      </main>

      {/* Trust bar */}
      <section className="relative border-t border-border/40 py-12">
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title:"Genuine Medicines", desc:"All medicines sourced from certified suppliers." },
            { icon: Truck, title:"Fast Delivery", desc:"Home delivery and same-day counter pickup available." },
            { icon: FileText, title:"Prescription Safe", desc:"Upload your Rx at checkout. Our pharmacist verifies it." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />

      {cartOpen && <CartSidebar cart={cart} onClose={() => { setCartOpen(false); setCart([]); }} onChange={updateQty} onRemove={removeFromCart} />}

      {/* Add to cart toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
