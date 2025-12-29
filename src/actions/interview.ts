"use server";

import { v4 as uuidv4 } from "uuid";
import { InterviewConfig } from "@/types";
import { redirect } from "next/navigation";
import { MOCK_QUESTIONS } from "@/lib/data/questions";

import { sessions } from "@/lib/db";

export async function startInterview(config: InterviewConfig) {
  const sessionId = uuidv4();
  const roleQuestions = MOCK_QUESTIONS[config.jobRole] || MOCK_QUESTIONS["default"];

  // Create mock initial session
  sessions[sessionId] = {
    id: sessionId,
    config,
    currentQuestionIndex: 0,
    questions: [roleQuestions[0]], // Start with first question
    answers: [],
    status: "Active",
    createdAt: new Date(),
  };

  redirect("/interview/" + sessionId);
}

export async function getSession(sessionId: string) {
  return sessions[sessionId] || null;
}

export async function submitAnswer(sessionId: string, answer: string) {
  const session = sessions[sessionId];
  if (!session) throw new Error("Session not found");

  // Save answer
  session.answers.push({
    questionId: session.questions[session.currentQuestionIndex].id,
    userAnswer: answer,
  });

  // Mock Logic for Next Question
  const roleQuestions = MOCK_QUESTIONS[session.config.jobRole] || MOCK_QUESTIONS["default"];
  const nextIndex = session.currentQuestionIndex + 1;

  if (nextIndex < roleQuestions.length) {
    session.currentQuestionIndex = nextIndex;
    session.questions.push(roleQuestions[nextIndex]);
    return { status: "Continue" };
  } else {
    session.status = "Completed";
    return { status: "Completed" };
  }
}
