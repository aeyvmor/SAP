"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
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
      className={cn(
        "border-t-8 border-t-zinc-700 shadow-lg rounded-xl p-6",
        className,
      )}
    >
      {children}
    </Card>
  );
}
