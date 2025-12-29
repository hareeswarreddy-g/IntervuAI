"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { InterviewSession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MessageSquare, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function SessionDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchSession = async () => {
            try {
                const docRef = doc(db, "users", user.uid, "interviews", sessionId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSession({ id: sessionId, ...docSnap.data() } as InterviewSession);
                } else {
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Failed to fetch session details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, user, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="mb-6 hover:bg-zinc-800"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{session.config.jobRole} Interview Review</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-primary/50 text-primary">
                            {session.config.experienceLevel}
                        </Badge>
                        <Badge variant="outline">
                            {session.config.interviewType}
                        </Badge>
                        <Badge variant="secondary">
                            {session.status}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                        {session.createdAt instanceof Date
                            ? session.createdAt.toLocaleDateString()
                            // @ts-ignore - handling Firestore timestamp if needed or raw date
                            : new Date(session.createdAt?.seconds * 1000 || session.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {session.questions.map((question, index) => {
                    // Find corresponding answer
                    const answer = session.answers.find(a => a.questionId === question.id);
                    const evaluation = answer?.evaluation;

                    return (
                        <Card key={question.id} className="glass-card overflow-hidden">
                            <CardHeader className="bg-zinc-900/50 border-b border-white/5 pb-4">
                                <CardTitle className="text-lg flex gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm shrink-0">
                                        Q{index + 1}
                                    </span>
                                    {question.text}
                                </CardTitle>
                                <CardDescription className="ml-11">
                                    Topic: {question.topic} • Difficulty: {question.difficulty}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* User Answer */}
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Your Answer
                                    </h4>
                                    <div className="bg-zinc-900/40 p-4 rounded-lg text-zinc-100 leading-relaxed border border-white/5">
                                        {answer?.userAnswer || "No answer recorded"}
                                    </div>
                                </div>

                                {/* AI Feedback */}
                                {evaluation ? (
                                    <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-5 rounded-xl border border-blue-500/10">
                                        <h4 className="text-sm font-medium text-blue-400 mb-4 flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            AI Feedback
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                                                <span className="text-sm text-zinc-400">Technical Accuracy</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-bold">{evaluation.technicalScore}/10</span>
                                                </div>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                                                <span className="text-sm text-zinc-400">Communication</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                                                    <span className="font-bold">{evaluation.communicationScore}/10</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Correctness */}
                                            <div className="flex items-center gap-2">
                                                {evaluation.correctness === "Correct" && (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">✓ Correct</Badge>
                                                )}
                                                {evaluation.correctness === "Partially Correct" && (
                                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">⚠ Partially Correct</Badge>
                                                )}
                                                {evaluation.correctness === "Incorrect" && (
                                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/50">✗ Incorrect</Badge>
                                                )}
                                            </div>

                                            {/* What They Got Right */}
                                            {evaluation.whatTheyGotRight && (
                                                <div className="text-sm">
                                                    <span className="text-green-400 font-semibold">✓ What You Got Right: </span>
                                                    <span className="text-zinc-300">{evaluation.whatTheyGotRight}</span>
                                                </div>
                                            )}

                                            {/* What They Missed */}
                                            {evaluation.whatTheyMissed && (
                                                <div className="text-sm">
                                                    <span className="text-yellow-400 font-semibold">⚠ What You Missed: </span>
                                                    <span className="text-zinc-300">{evaluation.whatTheyMissed}</span>
                                                </div>
                                            )}

                                            {/* Complete Explanation */}
                                            <div className="text-sm border-l-2 border-blue-500/30 pl-4">
                                                <span className="text-blue-400 font-semibold">📚 Complete Explanation: </span>
                                                <span className="text-zinc-300 italic">{evaluation.completeExplanation}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic px-4">
                                        No AI evaluation available for this answer.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
