import { Question } from "@/types";

export const MOCK_QUESTIONS: Record<string, Question[]> = {
    "Cloud": [
        {
            id: "q1",
            text: "Explain the difference between Horizontal and Vertical scaling in cloud computing. When would you use one over the other?",
            topic: "Scalability",
            difficulty: "Easy"
        },
        {
            id: "q2",
            text: "How does a Load Balancer work, and what are the different algorithms used for traffic distribution?",
            topic: "Networking",
            difficulty: "Medium"
        },
        {
            id: "q3",
            text: "Describe the concept of 'Infrastructure as Code' (IaC). What are its benefits and potential downsides?",
            topic: "DevOps",
            difficulty: "Medium"
        }
    ],
    "DevOps": [
        {
            id: "q1",
            text: "What is CI/CD? Explain the typical stages in a CI/CD pipeline.",
            topic: "CI/CD",
            difficulty: "Easy"
        },
        {
            id: "q2",
            text: "Explain the concept of containerization. How is Docker different from a Virtual Machine?",
            topic: "Containers",
            difficulty: "Medium"
        }
    ],
    // Fallback for others
    "default": [
        {
            id: "q_intro",
            text: "Tell me about a challenging technical problem you solved recently. What was your approach?",
            topic: "Behavioral",
            difficulty: "Easy"
        }
    ]
};
