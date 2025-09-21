"use client";

import {
    ChartAreaIcon,
    LayoutDashboard,
    Package,
    Wrench,
    LucideApple,
    Calculator,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
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
        title: "MRP Planning",
        url: "/mrp",
        icon: Calculator,
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: ChartAreaIcon,
    },
];

export function Navbar() {
    const pathname = usePathname();

    const isActive = (url: string) => {
        if (url === "/" && pathname === "/") return true;
        return pathname.startsWith(url) && url !== "/";
    };

    return (
        <nav className="w-full py-3 bg-white border-b border-zinc-400 shadow-lg fixed top-0 z-50">
            <div className="flex gap-5 flex-col justify-between items-center">
                <Link href="/">
                    <LucideApple />
                </Link>

                <div className="flex items-center space-x-1">
                    {navigation.map((nav) => {
                        const Icon = nav.icon;
                        const active = isActive(nav.url);

                        return (
                            <Link
                                key={nav.title}
                                href={nav.url}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-zinc-900 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }`}
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
