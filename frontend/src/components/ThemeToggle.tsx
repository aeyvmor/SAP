"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the
    // button after the component has mounted.
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="lg"
            className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg h-14 w-14 text-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <span className="transition-all duration-300">
                {theme === "dark" ? "☀️" : "🌙"}
            </span>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}