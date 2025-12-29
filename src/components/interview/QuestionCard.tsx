"use client";

import { Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
    question: Question;
    questionIndex: number;
    totalQuestions?: number;
}

export function QuestionCard({ question, questionIndex, totalQuestions }: QuestionCardProps) {
    return (
        <Card className="glass-card border-l-4 border-l-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Scanning Topic: {question.topic}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-mono">
                        {totalQuestions ? "Q" + (questionIndex + 1) + "/" + totalQuestions : "Question " + (questionIndex + 1)}
                    </span>
                </div>
                <CardTitle className="text-xl md:text-2xl font-medium leading-relaxed">
                    {question.text}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic">
                    Difficulty: {question.difficulty}
                </p>
            </CardContent>
        </Card>
    );
}
