
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("API Key is missing in process.env");
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }
        console.log("Using API Key:", apiKey.substring(0, 8) + "...");

        const { question, answer, jobRole } = await req.json();

        if (!question || !answer) {
            return NextResponse.json(
                { error: "Missing question or answer" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are a helpful technical tutor for a ${jobRole || "Software Engineering"} student.
        
        Question: "${question}"
        Student's Answer: "${answer}"
        
        Your job is to TEACH, not judge. Evaluate their answer and provide:
        
        1. Correctness: Is their answer "Correct", "Partially Correct", or "Incorrect"?
        2. What They Got Right: List the accurate points they mentioned (if any)
        3. What They Missed: Key points they didn't cover
        4. Complete Explanation: Provide the full, correct answer to the question
        
        Also provide hidden scores for analytics (1-10):
        - Technical Score: How technically accurate was their answer?
        - Communication Score: How clearly did they explain?
        
        Return pure JSON with this structure (no markdown):
        {
            "correctness": "Correct" | "Partially Correct" | "Incorrect",
            "whatTheyGotRight": "Brief summary of correct points",
            "whatTheyMissed": "Brief summary of missing points",
            "completeExplanation": "The full, correct answer (2-3 sentences max)",
            "technicalScore": number (1-10),
            "communicationScore": number (1-10)
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
            console.error("Failed to parse AI response:", text);
            return NextResponse.json(
                {
                    correctness: "Partially Correct",
                    whatTheyGotRight: "Your answer shows understanding of the topic.",
                    whatTheyMissed: "Some key details could be expanded.",
                    completeExplanation: "We couldn't generate detailed feedback at this moment, but your answer has been recorded for review.",
                    technicalScore: 5,
                    communicationScore: 5
                },
                { status: 200 }
            );
        }

    } catch (error: any) {
        console.error("AI Evaluation Error:", error);

        // Provide a clearer error message in the feedback
        let errorMessage = "Failed to evaluate answer.";
        if (error.message?.includes("400") || error.message?.includes("API key")) {
            errorMessage = "Invalid API Key. Please check your .env.local file.";
        } else if (error.message?.includes("404")) {
            errorMessage = "AI Model not found on this API key. Your key might be invalid.";
        }

        return NextResponse.json(
            {
                technicalScore: 0,
                communicationScore: 0,
                feedback: `System Error: ${errorMessage}`
            },
            { status: 200 } // Return as success so UI displays the message
        );
    }
}
