import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, BarChart3 } from "lucide-react";

export default function ResultPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
            <div className="w-full max-w-lg glass-card p-12 rounded-3xl border border-white/10 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Interview Completed!</h1>
                <p className="text-muted-foreground mb-8">
                    Great job! You&apos;ve successfully completed the mock interview session.
                    Check your analytics dashboard for detailed feedback.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link href="/dashboard" className="flex-1">
                        <Button className="w-full h-12 text-base shadow-lg shadow-primary/20">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Results
                        </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full h-12 text-base">
                            <Home className="w-4 h-4 mr-2" />
                            Back Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
