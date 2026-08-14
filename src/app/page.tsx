import CoreFeatures from "@/components/landingpage/CoreFeatures";
import Hero from "@/components/landingpage/Hero";
import ReactLoop from "@/components/landingpage/ReactLoop";

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero Section */}
      <Hero />
      {/* How it Works - The ReAct Loop */}
      <ReactLoop />
      {/* Core Features & Safety Bounds */}
      <CoreFeatures />
    </div>
  );
}
