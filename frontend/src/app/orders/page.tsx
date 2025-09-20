import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";

const orders = [
    {
        id: "PO4206967",
        status: "IN_PROGRESS",
        priority: "HIGH",
        model: "iPhone 15 Pro 256GB Natural Titanium",
        qty: 5000,
        due: "2025-09-29",
        progress: 40,
    },
];

export default function Home() {
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
