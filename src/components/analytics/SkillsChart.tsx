"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
    data: { subject: string; A: number; fullMark: number }[];
}

export function SkillsChart({ data }: Props) {

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#71717a" strokeWidth={1.5} />
                    <PolarAngleAxis
                        dataKey="subject"
                        stroke="#d4d4d8"
                        fontSize={13}
                        tick={{ fill: '#e4e4e7', fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="#71717a"
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        axisLine={false}
                    />
                    <Radar
                        name="Skill Level"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
