"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function Header() {
    const { user, loading, logout } = useAuth();
    return (
        <nav className="glass-header w-full px-6 py-4 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-2">
                <div className="relative w-12 h-12">
                    <img src="/logo.png" alt="AI MockInterview Logo" className="w-full h-full object-contain" />
                </div>
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Intervu<span className="text-primary">AI</span>
                </Link>
            </div>

            <div className="flex items-center gap-6">
                {user && (
                    <>
                        <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/setup" className="text-sm font-medium hover:text-primary transition-colors">
                            Practice
                        </Link>
                    </>
                )}
                <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                    How it works
                </Link>

                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden md:block">Hi, {user.displayName?.split(' ')[0]}</span>
                        <Button onClick={() => logout()} variant="outline" size="sm">
                            Sign Out
                        </Button>
                    </div>
                ) : (
                    <Link href="/login">
                        <Button variant="default" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            Sign In
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
}
