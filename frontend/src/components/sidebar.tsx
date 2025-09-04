"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { ChartAreaIcon, LayoutDashboard, Package, Wrench } from "lucide-react";
import Link from "next/link";

const items = [
    {
        title: "Dashboard",
        url: "#",
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

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="px-3 flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-3">
                        <Package className="h-16 w-16 text-blue-600" />
                        <Label className="font-extrabold text-lg leading-[1.1]">
                            SAP Manufacturing Dashboard
                        </Label>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
