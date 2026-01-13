export type JobRole =
    | "Fullstack Developer" | "Frontend Developer" | "Backend Developer" | "DevOps Engineer"
    | "Android Developer" | "iOS Developer" | "AI/ML Engineer" | "Cybersecurity Analyst"
    | "Cloud Architect" | "Product Manager" | "UI/UX Designer" | "Graphic Designer"
    | "Data Scientist" | "Data Analyst" | "Digital Marketer" | "Business Analyst"
    | "Project Manager" | "HR Manager" | "Sales Representative" | "Content Strategist";

export type ExperienceLevel = "Student" | "Fresher" | "Intermediate" | "Advanced";
export type InterviewType = "Technical" | "Behavioral" | "System Design" | "Managerial" | "Case Study" | "HR";

export interface InterviewConfig {
    jobRole: JobRole;
    experienceLevel: ExperienceLevel;
    interviewType: InterviewType;
}

export interface Question {
    id: string;
    text: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

export interface Answer {
    questionId: string;
    userAnswer: string;
    audioUrl?: string; // For voice mode later
    evaluation?: {
        correctness: "Correct" | "Partially Correct" | "Incorrect";
        whatTheyGotRight: string;
        whatTheyMissed: string;
        completeExplanation: string;
        technicalScore: number; // Still tracked for analytics
        communicationScore: number; // Still tracked for analytics
    };
}

export interface InterviewSession {
    id: string;
    config: InterviewConfig;
    currentQuestionIndex: number;
    questions: Question[];
    answers: Answer[];
    status: "Active" | "Completed";
    createdAt: Date;
    userId?: string;
    userEmail?: string | null;
}
