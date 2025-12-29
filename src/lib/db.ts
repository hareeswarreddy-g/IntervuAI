import { InterviewSession } from "@/types";

// Mock in-memory store (will be replaced by DB later)
// accessible only on the server
export const sessions: Record<string, InterviewSession> = {};
