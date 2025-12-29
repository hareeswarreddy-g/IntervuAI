"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins.toString().padStart(2, '0') + ":" + secs.toString().padStart(2, '0');
  };

  return (
    <div className="flex items-center gap-2 font-mono text-sm text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5">
      <Clock className="w-4 h-4 text-primary" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
