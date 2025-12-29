import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Trophy, BarChart3, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10 rounded-full w-[600px] h-[600px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors">
          <Trophy className="w-4 h-4" />
          <span>#1 IntervuAI Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
          Master Your Next <br />
          <span className="gradient-text">Technical Interview</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Practice with our AI-powered interviewer that adapts to your responses,
          provides real-time feedback, and helps you improve your confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/setup">
            <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all rounded-full">
              Start Mock Interview
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full hover:bg-muted/50">
              View Analytics
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 hover:border-primary/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Real-time Adaptation</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our AI engine adjusts the difficulty and topic depth based on your answers,
            simulating a real interviewer&apos;s thought process.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 hover:border-primary/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Instant Feedback</h3>
          <p className="text-muted-foreground leading-relaxed">
            Get detailed scores on technical correctness, clarity, and depth immediately
            after each answer. No more guessing.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 hover:border-primary/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Deep Analytics</h3>
          <p className="text-muted-foreground leading-relaxed">
            Track your progress over time with detailed charts, identifying your strong
            areas and weak points to focus on.
          </p>
        </div>
      </section>
    </div>
  );
}
