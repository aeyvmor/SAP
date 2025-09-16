"use client";

import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
    return (
        <div className="flex-1 border border-t-[10px] border-t-zinc-600 shadow-lg rounded-3xl py-5 px-5">
            {children}
        </div>
    );
}
