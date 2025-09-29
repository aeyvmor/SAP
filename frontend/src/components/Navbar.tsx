"use client";

import { useCallback } from "react";
import {
    LayoutDashboard,
    Package,
    Wrench,
    LucideApple,
    Calculator,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
    {
        title: "MRP Planning",
        url: "/mrp",
        icon: Calculator,
    },
    {
        title: "Orders",
        url: "/orders",
        icon: Package,
    },
    {
        title: "Materials",
        url: "/materials",
        icon: Wrench,
    },
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
];

export function Navbar() {
    const pathname = usePathname();

    const isActive = useCallback(
        (url: string) => {
            if (url === "/" && pathname === "/") return true;
            return pathname.startsWith(url) && url !== "/";
        },
        [pathname]
    );

    return (
        <nav className="w-full py-3 bg-background border-b border-border shadow-sm fixed top-0 z-50">
            <div className="flex gap-5 flex-col justify-between items-center">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <LucideApple className="h-6 w-6" />
                </Link>

                <div className="flex items-center space-x-1">
                    {navigation.map((nav) => {
                        const Icon = nav.icon;
                        const active = isActive(nav.url);

                        return (
                            <Link
                                key={nav.title}
                                href={nav.url}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    active
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {nav.title}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
