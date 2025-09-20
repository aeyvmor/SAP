"use client";

import {
    ChartAreaIcon,
    LayoutDashboard,
    Package,
    Wrench,
    LucideApple,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
        title: "Analytics",
        url: "#",
        icon: ChartAreaIcon,
    },
];

export function Navbar() {
    const [activePage, setActivePage] = useState("");

    return (
        <nav
            className={`w-full flex items-center py-5 fixed top-0 z-20 bg-white`}
        >
            <div className="gap-5 w-full flex flex-col justify-between items-center">
                <Link
                    href={"/"}
                    className="flex items-center"
                    onClick={() => {
                        setActivePage("");
                        window.scrollTo(0, 0);
                    }}
                >
                    <LucideApple />
                </Link>
                <div className="flex border-y border-zinc-400 shadow-lg w-full justify-center">
                    <ul className="flex justify-center items-center list-none flex-row gap-5 w-full">
                        {navigation.map((nav) => (
                            <li
                                key={nav.title}
                                className={`${
                                    activePage === nav.title
                                        ? "bg-zinc-800 text-white"
                                        : "text-black"
                                } py-2 px-5 rounded-lg text-[18px] font-medium cursor-pointer flex items-center`}
                                onClick={() => setActivePage(nav.title)}
                            >
                                <Link href={nav.url}>{nav.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
