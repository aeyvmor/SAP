"use client";

import {
    ChartAreaIcon,
    LayoutDashboard,
    Package,
    Wrench,
    LucideApple,
    Cross,
    Hamburger,
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
        url: "#",
        icon: Package,
    },
    {
        title: "Materials",
        url: "#",
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
    const [menuOpen, toggleMenu] = useState(false);

    return (
        <nav
            className={`w-full flex items-center py-5 fixed top-0 z-20 bg-white`}
        >
            <div className="gap-5 w-full flex flex-col justify-between items-center">
                <Link
                    href={"/"}
                    className="flex items-center gap-2"
                    onClick={() => {
                        setActivePage("");
                        window.scrollTo(0, 0);
                    }}
                >
                    <LucideApple />
                </Link>
                <div className="hidden sm:flex border-y border-zinc-900 shadow-lg w-full justify-center">
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

                <div className="sm:hidden flex flex-1 justify-end items-center">
                    <button
                        className="w-[28px] h-[28px] object-contain cursor-pointer"
                        onClick={() => {
                            toggleMenu(!menuOpen);
                        }}
                    >
                        {menuOpen ? (
                            <Cross className="fill-white hover:fill-zinco-300" />
                        ) : (
                            <Hamburger className="fill-white hover:fill-zinco-300" />
                        )}
                    </button>
                    <div
                        className={`${
                            !menuOpen ? "hidden" : "flex"
                        } p-6 bg-black-200 absolute top-20 mx-4 my-2 min-w-[140px] rounded-xl`}
                    >
                        <ul className="list-none flex justify-end items-start flex-col gap-4">
                            {navigation.map((nav) => (
                                <li
                                    key={nav.title}
                                    className={`${
                                        activePage === nav.title
                                            ? "text-white"
                                            : "text-zinc-300"
                                    }   hover:text-white text-[18px] font-medium cursor-pointer
                                    `}
                                    onClick={() => {
                                        toggleMenu(!menuOpen);
                                        setActivePage(nav.title);
                                    }}
                                >
                                    <Link href={nav.url}>{nav.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
