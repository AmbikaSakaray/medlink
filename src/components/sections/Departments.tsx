"use client";

import { motion } from "motion/react";
import { Tilt3D } from "@/components/public/Tilt3D";
import { SectionHeading } from "@/components/public/SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const departments = [
  { name: "Cardiology",       desc: "Heart & cardiovascular care"   },
  { name: "Orthopedics",      desc: "Bone, joint & spine experts"   },
  { name: "Neurology",        desc: "Brain & nervous system care"   },
  { name: "Pediatrics",       desc: "Compassionate child care"      },
  { name: "Dermatology",      desc: "Skin, hair & aesthetics"       },
  { name: "General Medicine", desc: "Everyday primary care"         },
];

export function Departments() {
  return (
    <section id="departments" className="relative overflow-hidden py-14">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Departments"
          title="Specialized Medical Departments"
          description="Expert teams across the disciplines that matter most for your family."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {departments.map(({ name, desc }) => (
            <motion.div key={name} variants={fadeUp}>
              <Tilt3D className="h-full">
                <div className="group flex h-full items-center rounded-3xl glass-card p-6 transition-all duration-300 hover:shadow-glow">
                  <div>
                    <h3 className="font-display text-lg font-bold">{name}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
