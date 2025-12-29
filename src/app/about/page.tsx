
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Settings, MessageSquare, FileText, BarChart3 } from "lucide-react";

export default function AboutPage() {
    const steps = [
        {
            icon: <Settings className="w-8 h-8 text-blue-400" />,
            title: "1. Customize Your Interview",
            description: "Choose your job role (e.g., Frontend, Backend, Fullstack), select specific tech stacks, and set the difficulty level from Junior to Architect.",
            color: "bg-blue-500/10"
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
            title: "2. AI-Driven Conversation",
            description: "Engage in a realistic voice or text-based interview. Our AI adapts follow-up questions based on your responses, just like a real interviewer.",
            color: "bg-purple-500/10"
        },
        {
            icon: <FileText className="w-8 h-8 text-pink-400" />,
            title: "3. Instant Feedback",
            description: "Receive immediate, detailed feedback on your answers. We analyze your technical accuracy, communication style, and provide improvements.",
            color: "bg-pink-500/10"
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-green-400" />,
            title: "4. Track Progress",
            description: "Review your performance analytics over time. Identify weak areas and mastered topics to focus your preparation effectively.",
            color: "bg-green-500/10"
        }
    ];

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 px-4">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        How <span className="text-primary">IntervuAI</span> Works
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Master your technical proficiency with our 4-step process designed to mimic real-world interview scenarios.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                            <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-8">
                    <Link href="/setup">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Start Your Preparation
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
