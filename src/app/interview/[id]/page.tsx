"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InterviewSession, Answer } from "@/types";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInput } from "@/components/interview/AnswerInput";
import { Timer } from "@/components/interview/Timer";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function InterviewPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingNext, setLoadingNext] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchSession = async () => {
            try {
                // Since we store interviews in users/{uid}/interviews/{sessionId}
                const docRef = doc(db, "users", user.uid, "interviews", sessionId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    console.error("Session not found");
                    router.push("/setup");
                    return;
                }

                const data = docSnap.data() as InterviewSession;
                // Add ID manually to the data since it's not in the document body
                setSession({ ...data, id: sessionId });

                if (data.status === "Completed") {
                    router.push("/interview/result");
                }
            } catch (error) {
                console.error("Failed to fetch session", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId, router, user, authLoading]);

    const handleAnswerSubmit = async (answerText: string) => {
        if (!session || !user) return;

        const currentQ = session.questions[session.currentQuestionIndex];
        if (!currentQ) {
            console.error("Current question not found for index:", session.currentQuestionIndex);
            return;
        }

        setSubmitting(true);
        try {
            // New: Call AI Evaluation API
            let evaluation = undefined;
            try {
                const response = await fetch("/api/generate-feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: currentQ.text,
                        answer: answerText,
                        jobRole: session.config.jobRole
                    })
                });

                if (response.ok) {
                    evaluation = await response.json();
                }
            } catch (aiError) {
                console.error("AI Eval failed (non-critical):", aiError);
            }

            const answer: Answer = {
                questionId: currentQ.id,
                userAnswer: answerText,
            };

            // Only add evaluation if it exists (Firestore doesn't like undefined)
            if (evaluation) {
                answer.evaluation = evaluation;
            }

            // Update Firestore with the answer BUT DO NOT advance the question index yet
            const docRef = doc(db, "users", user.uid, "interviews", sessionId);
            await updateDoc(docRef, {
                answers: arrayUnion(answer)
            });

            // Update local state to show the feedback immediately
            setSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    answers: [...prev.answers, answer]
                };
            });

        } catch (error) {
            console.error("Failed to submit answer", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextQuestion = async () => {
        if (!session || !user) return;
        setLoadingNext(true);

        try {
            const nextIndex = session.currentQuestionIndex + 1;
            const isCompleted = nextIndex >= 5; // Limit to 5 questions

            const docRef = doc(db, "users", user.uid, "interviews", sessionId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: any = {
                currentQuestionIndex: isCompleted ? session.currentQuestionIndex : nextIndex,
                status: isCompleted ? "Completed" : "Active"
            };

            let nextQuestion = null;

            if (!isCompleted) {
                // Generate next question using AI
                try {
                    const previousQuestions = session.questions.map(q => q.text);

                    const response = await fetch("/api/generate-question", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            jobRole: session.config.jobRole,
                            difficulty: session.config.experienceLevel,
                            previousQuestions
                        })
                    });

                    if (response.ok) {
                        const generatedQuestion = await response.json();
                        nextQuestion = {
                            id: `q-${Date.now()}`,
                            text: generatedQuestion.question,
                            topic: generatedQuestion.topic,
                            difficulty: generatedQuestion.difficulty as "Easy" | "Medium" | "Hard"
                        };
                        updates.questions = arrayUnion(nextQuestion);
                    }
                } catch (error) {
                    console.error("Failed to generate next question:", error);
                }
            }

            await updateDoc(docRef, updates);

            if (isCompleted) {
                router.push("/interview/result");
            } else {
                // Manually update local state to avoid full refetch delay
                setSession(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        currentQuestionIndex: nextIndex,
                        questions: nextQuestion ? [...prev.questions, nextQuestion] : prev.questions
                    };
                });
            }

        } catch (error) {
            console.error("Error moving to next question:", error);
        } finally {
            setLoadingNext(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    // Check if the current question has already been answered in this session
    // Since answers are appended, the answer at [currentQuestionIndex] corresponds to the current question
    const currentAnswer = session.answers[session.currentQuestionIndex];

    const totalQuestions = 5; // Hardcoded limit for MVP
    const progress = ((session.currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-semibold">{session.config.jobRole} Interview</h2>
                    <p className="text-sm text-muted-foreground">{session.config.interviewType} • {session.config.experienceLevel}</p>
                </div>
                <Timer />
            </div>

            <div className="mb-8">
                <Progress value={progress} className="h-1" />
            </div>

            <div className="grid gap-8">
                {currentQuestion && (
                    <QuestionCard
                        question={currentQuestion}
                        questionIndex={session.currentQuestionIndex}
                        totalQuestions={totalQuestions}
                    />
                )}

                {/* If there is an answer for the current question, show Feedback + Next Button. Otherwise, show Input. */}
                {currentAnswer ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Feedback Section */}
                        <div className="bg-zinc-900/50 border border-primary/20 rounded-xl p-6 mb-6 shadow-2xl shadow-primary/5">
                            <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                                AI Feedback
                            </h3>

                            {currentAnswer.evaluation ? (
                                <div className="space-y-4">
                                    {/* Correctness Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        {currentAnswer.evaluation.correctness === "Correct" && (
                                            <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2">
                                                <span className="text-xl">✓</span> Correct!
                                            </div>
                                        )}
                                        {currentAnswer.evaluation.correctness === "Partially Correct" && (
                                            <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 font-semibold flex items-center gap-2">
                                                <span className="text-xl">⚠</span> Partially Correct
                                            </div>
                                        )}
                                        {currentAnswer.evaluation.correctness === "Incorrect" && (
                                            <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold flex items-center gap-2">
                                                <span className="text-xl">✗</span> Incorrect
                                            </div>
                                        )}
                                    </div>

                                    {/* What They Got Right */}
                                    {currentAnswer.evaluation.whatTheyGotRight && (
                                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                                            <div className="text-sm font-semibold text-green-400 mb-2">✓ What You Got Right:</div>
                                            <div className="text-zinc-300">{currentAnswer.evaluation.whatTheyGotRight}</div>
                                        </div>
                                    )}

                                    {/* What They Missed */}
                                    {currentAnswer.evaluation.whatTheyMissed && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                            <div className="text-sm font-semibold text-yellow-400 mb-2">⚠ What You Missed:</div>
                                            <div className="text-zinc-300">{currentAnswer.evaluation.whatTheyMissed}</div>
                                        </div>
                                    )}

                                    {/* Complete Explanation */}
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-blue-400 mb-2">📚 Complete Explanation:</div>
                                        <div className="text-zinc-300 leading-relaxed">{currentAnswer.evaluation.completeExplanation}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No feedback generated.</p>
                            )}
                        </div>

                        <button
                            onClick={handleNextQuestion}
                            disabled={loadingNext}
                            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loadingNext ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading Next...
                                </>
                            ) : (
                                "Next Question"
                            )}
                        </button>
                    </div>
                ) : (
                    <AnswerInput
                        onSubmit={handleAnswerSubmit}
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </div>
    );
}
