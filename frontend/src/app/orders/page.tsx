"use client";

import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Home() {
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
        status: string;
        priority: string;
        model: string;
        qty: number;
        due: string;
        progress: number;
    }>;

    return (
        <div className="flex flex-1 flex-col gap-10 max-w-7xl">
            <div className="flex flex-1">
                <p className="text-xl mr-auto">Production Orders</p>
                <Button className="rounded-xl">Create New Order</Button>
            </div>
            <div className="flex flex-col">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <p className="text-2xl font-bold">{order.id}</p>
                        <p>
                            {order.status}, {order.priority}
                        </p>
                        <p>{order.model}</p>
                        <p>
                            Qty: {order.qty}, Due: {order.due}
                        </p>
                        <p>Progress:</p>
                        <div className="w-full bg-zinc-200 rounded h-2">
                            <div
                                className="bg-zinc-700 h-2 rounded"
                                style={{ width: `${order.progress}%` }}
                            ></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
