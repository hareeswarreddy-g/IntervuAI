"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Trophy, Clock, Flame, Loader2 } from "lucide-react";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { SkillsChart } from "@/components/analytics/SkillsChart";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { InterviewSession } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<InterviewSession[]>([]);

    // Skills Data State
    const [skillsData, setSkillsData] = useState([
        { subject: "Technical", A: 0, fullMark: 100 },
        { subject: "Communication", A: 0, fullMark: 100 },
        { subject: "Problem Solving", A: 0, fullMark: 100 },
        { subject: "Clarity", A: 0, fullMark: 100 },
        { subject: "Confidence", A: 0, fullMark: 100 }
    ]);

    // Analytics State
    const [analytics, setAnalytics] = useState({
        totalInterviews: 0,
        averageScore: 0,
        hoursPracticed: 0,
        streakDays: 0
    });

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const q = query(
                    collection(db, "users", user.uid, "interviews"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedInterviews: InterviewSession[] = [];

                querySnapshot.forEach((doc: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const data = doc.data() as any;
                    fetchedInterviews.push({
                        ...data,
                        id: doc.id,
                        // Firestore timestamps need conversion
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                    } as InterviewSession);
                });

                setInterviews(fetchedInterviews);

                // Calculate Analytics
                const completed = fetchedInterviews.filter(i => i.status === "Completed");

                let totalTech = 0;
                let totalComm = 0;
                let count = 0;

                completed.forEach(session => {
                    session.answers.forEach(ans => {
                        if (ans.evaluation) {
                            totalTech += ans.evaluation.technicalScore || 0;
                            totalComm += ans.evaluation.communicationScore || 0;
                            count++;
                        }
                    });
                });

                const avgTech = count ? (totalTech / count) * 10 : 0; // Scale to 0-100
                const avgComm = count ? (totalComm / count) * 10 : 0;
                const avgScore = count ? ((totalTech + totalComm) / (count * 2)).toFixed(1) : "0";

                setSkillsData([
                    { subject: "Technical", A: Math.round(avgTech), fullMark: 100 },
                    { subject: "Communication", A: Math.round(avgComm), fullMark: 100 },
                    { subject: "Problem Solving", A: Math.round(avgTech), fullMark: 100 }, // Aliased
                    { subject: "Clarity", A: Math.round(avgComm), fullMark: 100 },         // Aliased
                    { subject: "Confidence", A: Math.round(avgComm), fullMark: 100 }       // Aliased
                ]);

                setAnalytics({
                    totalInterviews: completed.length,
                    averageScore: parseFloat(avgScore),
                    hoursPracticed: parseFloat((completed.length * 0.5).toFixed(1)), // Mocking 30 mins per interview
                    streakDays: 0 // advanced logic needed for streaks
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Your Performance Dashboard</h1>
                <p className="text-muted-foreground">Track your progress and identify areas for improvement.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalInterviews}</div>
                        <p className="text-xs text-muted-foreground">Completed sessions</p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.averageScore}/10</div>
                        <p className="text-xs text-muted-foreground">Based on completed interviews</p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hours Practiced</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.hoursPracticed}h</div>
                        <p className="text-xs text-muted-foreground">Total time spent</p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.streakDays} Days</div>
                        <p className="text-xs text-muted-foreground">Keep the momentum!</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="overview">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Interview Session History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {interviews.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No interviews found. Start your first session!
                                    </div>
                                ) : (
                                    interviews.map((session: InterviewSession) => (
                                        <Link href={`/dashboard/${session.id}`} key={session.id} className="block">
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-800/40 transition-all cursor-pointer">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{session.config.jobRole} Interview</h4>
                                                    <p className="text-sm text-muted-foreground">{session.config.interviewType} • {session.createdAt instanceof Date ? session.createdAt.toLocaleDateString() : 'Just now'}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                        {session.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card col-span-1 min-h-[400px]">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <PerformanceChart data={interviews
                                    .filter((i: InterviewSession) => i.status === "Completed")
                                    .slice(0, 10) // Last 10 interviews
                                    .reverse() // Chronological order
                                    .map((i: InterviewSession) => {
                                        let tech = 0;
                                        let comm = 0;
                                        let count = 0;
                                        i.answers.forEach((a) => {
                                            if (a.evaluation) {
                                                tech += a.evaluation.technicalScore || 0;
                                                comm += a.evaluation.communicationScore || 0;
                                                count++;
                                            }
                                        });
                                        const date = i.createdAt instanceof Date
                                            ? i.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            : "N/A";

                                        // Calculate average score on 0-10 scale
                                        const score = count ? parseFloat(((tech + comm) / (count * 2)).toFixed(1)) : 0;

                                        return {
                                            date,
                                            score
                                        };
                                    })} />
                            </CardContent>
                        </Card>
                        <Card className="glass-card col-span-1 min-h-[400px]">
                            <CardHeader>
                                <CardTitle>Skill Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <SkillsChart data={skillsData} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
