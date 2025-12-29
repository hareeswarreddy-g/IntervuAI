import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const { jobRole, difficulty, topic, previousQuestions, interviewType } = await req.json();

        if (!jobRole || !difficulty) {
            return NextResponse.json(
                { error: "Missing jobRole or difficulty" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Build a list of previous questions to avoid duplicates
        const prevQuestionsText = previousQuestions && previousQuestions.length > 0
            ? `\nAvoid asking these questions:\n${previousQuestions.map((q: string) => `- ${q}`).join('\n')}`
            : '';

        // Difficulty-specific guidelines
        let difficultyGuidelines = "";
        if (difficulty === "Fresher") {
            difficultyGuidelines = "IMPORTANT: Focus on basic concepts, definitions, and avoiding complex scenarios.";
        } else if (difficulty === "Intermediate") {
            difficultyGuidelines = "Focus on practical application, real-world scenarios, and some problem-solving.";
        } else if (difficulty === "Advanced") {
            difficultyGuidelines = "Focus on deep technical knowledge, complex trade-offs, architecture, and system design thinking.";
        }

        // Round-specific guidelines
        let roundGuidelines = "";
        if (interviewType === "Behavioral") {
            roundGuidelines = "Generate a behavioral question using the STAR method (Situation, Task, Action, Result). Focus on soft skills, teamwork, conflict resolution, or past experiences.";
        } else if (interviewType === "System Design") {
            roundGuidelines = "Generate a system design question suitable for the role. Focus on high-level architecture, scalability, data modeling, or component design.";
        } else if (interviewType === "Managerial") {
            roundGuidelines = "Generate a managerial or leadership question. Focus on team management, project delivery, stakeholder management, or strategic thinking.";
        } else if (interviewType === "Case Study") {
            roundGuidelines = "Generate a business or product case study scenario. Ask the candidate to analyze a problem and propose a solution.";
        } else if (interviewType === "HR") {
            roundGuidelines = "Generate a common HR interview question regarding cultural fit, career goals, or company interest.";
        } else {
            // Default to Technical
            roundGuidelines = "Generate a technical interview question testing core skills and knowledge relevant to the role.";
        }

        const prompt = `
        You are an expert technical interviewer creating interview questions.
        
        Job Role: ${jobRole}
        Difficulty: ${difficulty}
        Interview Round: ${interviewType || "Technical"}
        ${topic ? `Topic Focus: ${topic}` : ''}
        ${prevQuestionsText}
        
        GUIDELINES:
        ${difficultyGuidelines}
        ${roundGuidelines}
        
        Generate ONE unique interview question that:
        1. Is appropriate for the ${difficulty} level and ${interviewType} round
        2. Tests relevant skills for a ${jobRole} role
        ${topic ? `3. Focuses on ${topic}` : ''}
        4. Is different from any previously asked questions
        
        Return pure JSON with this structure (no markdown):
        {
            "question": "The interview question text",
            "topic": "Main topic (e.g., Scalability, Databases, Algorithms)",
            "difficulty": "${difficulty}",
            "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Failed to parse AI question response:", text);
            // Return a fallback question
            return NextResponse.json({
                question: `Explain a key concept in ${jobRole} that you find important.`,
                topic: "General",
                difficulty: difficulty,
                expectedKeyPoints: ["Clear explanation", "Practical examples", "Understanding of fundamentals"]
            });
        }

    } catch (error) {
        console.error("Question Generation Error:", error);

        if (error instanceof Error && (error.message.includes("429") || error.message.includes("quota"))) {
            console.warn("API quota exceeded. Using fallback question.");
        }

        // Return fallback instead of error to keep flow going
        return NextResponse.json({
            question: "Describe your experience and approach to problem-solving in your field.",
            topic: "General",
            difficulty: "Medium",
            expectedKeyPoints: ["Problem-solving methodology", "Real examples", "Learning approach"]
        });
    }
}
