import {
  ShieldCheck,
  Database,
  BrainCircuit,
  Lock,
  HeartPulse,
  SearchCheck,
} from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Human-in-the-loop",
  },
  {
    icon: Database,
    title: "Read-only EHR Access",
  },
  {
    icon: BrainCircuit,
    title: "Bounded AI Agents",
  },
  {
    icon: Lock,
    title: "HIPAA Ready",
  },
  {
    icon: HeartPulse,
    title: "Clinical Safety",
  },
  {
    icon: SearchCheck,
    title: "Explainable Decisions",
  },
];

export default function TrustBanner() {
  return (
    <section className="border-y border-white/10 bg-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-10 grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-8">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-center gap-3 justify-center text-slate-300"
            >
              <Icon className="text-blue-400" size={22} />
              <span>{item.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
