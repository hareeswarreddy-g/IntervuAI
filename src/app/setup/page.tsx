"use client";

import { useState, useEffect } from "react";
import { JobRole, ExperienceLevel, InterviewType, InterviewSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, BarChart, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SetupPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<{
        jobRole: JobRole;
        experienceLevel: ExperienceLevel;
        interviewType: InterviewType;
    }>({
        jobRole: "Fullstack Developer",
        experienceLevel: "Intermediate",
        interviewType: "Technical",
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleStart = async () => {
        setLoading(true);
        try {
            // Client-side Firestore Creation
            if (!user) return;

            // Generate first question using AI
            const firstQuestionResponse = await fetch("/api/generate-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobRole: config.jobRole,
                    difficulty: config.experienceLevel,
                    interviewType: config.interviewType,
                    previousQuestions: []
                })
            });

            if (!firstQuestionResponse.ok) {
                const errorData = await firstQuestionResponse.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to generate question");
            }

            const firstQuestion = await firstQuestionResponse.json();

            // Create a proper Question object with ID
            const questionWithId = {
                id: `q-${Date.now()}`,
                text: firstQuestion.question,
                topic: firstQuestion.topic,
                difficulty: firstQuestion.difficulty as "Easy" | "Medium" | "Hard"
            };

            const sessionData: Omit<InterviewSession, 'id'> = {
                userId: user.uid,
                config,
                currentQuestionIndex: 0,
                questions: [questionWithId], // Start with AI-generated question
                answers: [],
                status: "Active",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                createdAt: new Date() as any,
                userEmail: user.email
            };

            const docRef = await addDoc(collection(db, "users", user.uid, "interviews"), {
                ...sessionData,
                createdAt: serverTimestamp()
            });

            router.push("/interview/" + docRef.id);
        } catch (error: any) {
            console.error("Failed to start interview:", error);
            alert(error.message || "Failed to start interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-10 px-4">
            <div className="w-full max-w-4xl glass-card p-8 md:p-12 rounded-3xl border border-white/5">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Your Interview</h1>
                    <p className="text-muted-foreground">Customize your session to match your career goals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Job Role */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Target Role</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(["Fullstack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Android Developer", "iOS Developer", "AI/ML Engineer", "Cybersecurity Analyst", "Cloud Architect", "Product Manager", "UI/UX Designer", "Graphic Designer", "Data Scientist", "Data Analyst", "Digital Marketer", "Business Analyst", "Project Manager", "HR Manager", "Sales Representative", "Content Strategist"] as JobRole[]).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setConfig({ ...config, jobRole: role })}
                                    className={cn(
                                        "flex items-center p-3 rounded-xl border transition-all text-left",
                                        config.jobRole === role
                                            ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20"
                                            : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg mr-3",
                                        config.jobRole === role ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400"
                                    )}>
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className={cn("font-medium text-sm", config.jobRole === role ? "text-primary" : "text-zinc-300")}>
                                        {role}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Experience Level */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Experience Level</label>
                            <div className="flex gap-2 p-1 bg-zinc-900/60 rounded-xl border border-white/5">
                                {(["Student", "Fresher", "Intermediate", "Advanced"] as ExperienceLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setConfig({ ...config, experienceLevel: level })}
                                        className={cn(
                                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                            config.experienceLevel === level
                                                ? "bg-primary text-white shadow-md"
                                                : "text-zinc-400 hover:text-zinc-200"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interview Type */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Focus Area</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(["Technical", "Behavioral", "System Design", "Managerial", "Case Study", "HR"] as InterviewType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setConfig({ ...config, interviewType: type })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                            config.interviewType === type
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/60"
                                        )}
                                    >
                                        <span className="text-sm font-medium">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>



                    </div>
                </div>

                <Button
                    onClick={handleStart}
                    disabled={loading}
                    size="lg"
                    className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Initializing Session...
                        </>
                    ) : "Start Interview Session"}
                </Button>
            </div>
        </div>
    );
}
