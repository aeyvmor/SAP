"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export default function StylizedCard({ children }: { children: ReactNode }) {
    return (
        <Card className="border border-t-[10px] border-t-zinc-600 shadow-lg rounded-3xl p-5">
            {children}
        </Card>
    );
}
