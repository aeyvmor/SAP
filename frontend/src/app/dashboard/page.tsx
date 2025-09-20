"use client";

import Card from "@/components/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["metrics"],
        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:8000/api/analytics/metrics"
            );
            return response.data;
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading dashboard metrics</div>;
    }

    return (
        <div className="flex flex-col gap-10 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <p className="text-lg">Total Orders</p>
                    <p className="text-3xl font-bold">{data.total_orders}</p>
                </Card>
                <Card>
                    <p className="text-lg">Active Orders</p>
                    <p className="text-3xl font-bold">{data.active_orders}</p>
                </Card>
                <Card>
                    <p className="text-lg">Completed Orders</p>
                    <p className="text-3xl font-bold">
                        {data.completed_orders}
                    </p>
                </Card>
            </div>
            <Card>
                <h2 className="text-xl font-bold">Production Trends</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total Orders</TableCell>
                            <TableCell>{data.total_orders}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Active Orders</TableCell>
                            <TableCell>{data.active_orders}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Completed Orders</TableCell>
                            <TableCell>{data.completed_orders}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
