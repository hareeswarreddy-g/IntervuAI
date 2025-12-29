"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Need to create this
import { Mic, Send, Loader2 } from "lucide-react";

interface AnswerInputProps {
    onSubmit: (answer: string) => Promise<void>;
    isSubmitting: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting }: AnswerInputProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        await onSubmit(answer);
        setAnswer("");
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[200px] p-4 rounded-xl bg-zinc-900/30 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none font-sans text-base leading-relaxed"
                    disabled={isSubmitting}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {/* Placeholder for Voice Mode */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-800/50 hover:bg-primary/20 hover:text-primary">
                        <Mic className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className="px-8 shadow-lg shadow-primary/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Answer
                            <Send className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
