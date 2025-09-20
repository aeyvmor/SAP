"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function OrdersPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:8000/api/production-orders"
            );
            return response.data;
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading production orders</div>;
    }

    const orders = data as Array<{
        id: string;
        orderId: string;
        materialId: string;
        quantity: number;
        status: string;
        priority: string;
        progress: number;
        dueDate: string;
        plant: string;
    }>;

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Production Orders</h2>
                <Button>Create New Order</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Material ID</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.orderId}</TableCell>
                            <TableCell>{order.materialId}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>
                                <Badge>{order.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        order.priority === "HIGH"
                                            ? "destructive"
                                            : "default"
                                    }
                                >
                                    {order.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Progress value={order.progress} />
                            </TableCell>
                            <TableCell>
                                {new Date(order.dueDate).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
