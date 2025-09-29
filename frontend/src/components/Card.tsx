"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StylizedCardProps {
    children: ReactNode;
    className?: string;
}

export default function StylizedCard({
    children,
    className,
}: StylizedCardProps) {
    return (
        <Card
            className={cn("border-t-4 border-t-primary shadow-lg", className)}
        >
            <CardContent className="p-6">{children}</CardContent>
        </Card>
    );
}
