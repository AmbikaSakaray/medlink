"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Tilt3D } from "@/components/public/Tilt3D";
import { SectionHeading } from "@/components/public/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

// Medical SVG icons — anatomically accurate, professional
const VideoConsultIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Monitor/screen */}
    <rect x="4" y="8" width="24" height="18" rx="2.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="4" y="8" width="24" height="18" rx="2.5" />
    {/* Play/video button */}
    <path d="M28 14l8 6-8 6V14z" fill="currentColor" fillOpacity="0.3" />
    <path d="M28 14l8 6-8 6V14z" />
    {/* Stethoscope on screen */}
    <path d="M10 14 q0 4 4 4 q4 0 4-4" strokeLinecap="round" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
    {/* Screen stand */}
    <line x1="16" y1="26" x2="16" y2="30" strokeWidth="2" />
    <line x1="12" y1="30" x2="20" y2="30" strokeLinecap="round" />
  </svg>
);

const HospitalBedIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Hospital H */}
    <rect x="6" y="6" width="28" height="28" rx="3" fill="currentColor" fillOpacity="0.12" />
    <rect x="6" y="6" width="28" height="28" rx="3" />
    {/* H cross */}
    <line x1="13" y1="13" x2="13" y2="27" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="27" y1="13" x2="27" y2="27" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="13" y1="20" x2="27" y2="20" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const MicroscopeIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Eyepiece */}
    <rect x="17" y="4" width="6" height="8" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="17" y="4" width="6" height="8" rx="1.5" />
    {/* Body tube */}
    <rect x="16" y="12" width="8" height="12" rx="1" />
    <ellipse cx="20" cy="12" rx="5" ry="2" fill="currentColor" fillOpacity="0.15" />
    {/* Stage */}
    <line x1="12" y1="28" x2="28" y2="28" strokeWidth="2.5" strokeLinecap="round" />
    {/* Base arm */}
    <path d="M20 24 L20 28" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 28 L12 34 L28 34" strokeLinecap="round" />
    {/* Specimen slide */}
    <rect x="15" y="27" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

const PrescriptionIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Rx prescription pad */}
    <rect x="7" y="4" width="26" height="32" rx="3" fill="currentColor" fillOpacity="0.12" />
    <rect x="7" y="4" width="26" height="32" rx="3" />
    {/* Rx symbol */}
    <path d="M14 12 L14 22" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M14 12 Q14 9 17 9 Q20 9 20 12 Q20 15 17 15 L14 15" strokeWidth="1.8" />
    <path d="M17 15 L21 22" strokeWidth="2" strokeLinecap="round" />
    {/* Lines for text */}
    <line x1="14" y1="26" x2="27" y2="26" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="14" y1="30" x2="24" y2="30" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const WellnessIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Clipboard/checklist */}
    <rect x="8" y="8" width="24" height="28" rx="2.5" fill="currentColor" fillOpacity="0.12" />
    <rect x="8" y="8" width="24" height="28" rx="2.5" />
    <path d="M16 8 Q16 5 20 5 Q24 5 24 8" strokeLinecap="round" />
    {/* Checkmarks */}
    <path d="M14 18 l3 3 l6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 26 l3 3 l6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Heartbeat on top */}
    <polyline points="13,14 15,14 16,11 18,17 19,12 21,14 23,14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmergencyAmbulanceIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    {/* Ambulance body */}
    <rect x="3" y="18" width="26" height="14" rx="2.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="3" y="18" width="26" height="14" rx="2.5" />
    {/* Cab */}
    <path d="M29 24 L29 18 L37 18 L37 32 L29 32" />
    {/* Red cross */}
    <line x1="13" y1="23" x2="13" y2="29" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="26" x2="16" y2="26" strokeWidth="2.5" strokeLinecap="round" />
    {/* Wheels */}
    <circle cx="10" cy="33" r="3.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="10" cy="33" r="3.5" />
    <circle cx="28" cy="33" r="3.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="28" cy="33" r="3.5" />
    {/* Siren */}
    <path d="M31 14 Q33 11 36 12" strokeLinecap="round" />
    <circle cx="33" cy="15" r="1.5" fill="currentColor" opacity="0.5" />
  </svg>
);

const services = [
  {
    Icon: VideoConsultIcon,
    title: "Online Doctor Consultation",
    desc: "Connect with certified specialists via encrypted video calls — anytime, from any device.",
    bg: "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/telemedicine/dashboard",
  },
  {
    Icon: HospitalBedIcon,
    title: "Hospital Booking",
    desc: "Reserve beds and appointments across 20+ partner hospitals in seconds.",
    bg: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/appointment",
  },
  {
    Icon: MicroscopeIcon,
    title: "Laboratory Testing",
    desc: "Book diagnostic tests with home sample collection and digital report delivery.",
    bg: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/appointment",
  },
  {
    Icon: PrescriptionIcon,
    title: "Pharmacy Services",
    desc: "Order authentic medicines with fast doorstep delivery and automated refill reminders.",
    bg: "https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/pharmacy",
  },
  {
    Icon: WellnessIcon,
    title: "Health Packages",
    desc: "Curated preventive checkups and annual wellness plans for every life stage.",
    bg: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/#packages",
  },
  {
    Icon: EmergencyAmbulanceIcon,
    title: "Emergency Support",
    desc: "24/7 emergency response with real-time ambulance tracking and triage coordination.",
    bg: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&w=600&h=400&fit=crop",
    href: "/emergency",
  },
];

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-14">
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Our Services"
          title="Comprehensive Care, One Platform"
          description="Everything you need for your health journey, designed to feel effortless."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map(({ Icon, title, desc, bg, href }) => (
            <motion.div key={title} variants={fadeUp}>
              <Tilt3D className="h-full">
                <Link
                  href={href}
                  className="group relative flex h-full overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-glow cursor-pointer"
                  style={{ minHeight: "300px" }}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                  {/* Gradient overlay — blends into page colour at top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/55 to-transparent" />
                  {/* Teal site-colour blend */}
                  <div className="absolute inset-0 opacity-25 mix-blend-multiply" style={{ background: "oklch(0.55 0.10 210)" }} />
                  {/* Primary teal tint on hover */}
                  <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col justify-end p-7">
                    <div
                      className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-white"
                      style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                    >
                      <Icon />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white transition-all duration-200 group-hover:gap-2">
                      Learn more <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              </Tilt3D>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
