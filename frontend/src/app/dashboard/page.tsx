"use client";

import { Card } from "@/components/Card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Home() {
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
        return <div>Error loading metrics</div>;
    }

    return (
        <div className="flex flex-col gap-10 max-w-7xl">
            <div className="flex flex-1 flex-row gap-5">
                <div className="flex flex-1 flex-col gap-5">
                    <Card>
                        <p>Total Production</p>
                        <h1 className="text-3xl font-bold">
                            {data.total_orders}
                        </h1>
                    </Card>
                    <Card>
                        <p>Efficiency Rate</p>
                        <h1 className="text-3xl font-bold">
                            {data.efficiencyRate}%
                        </h1>
                    </Card>
                    <Card>
                        <p>Active Orders</p>
                        <h1 className="text-3xl font-bold">
                            {data.active_orders}
                        </h1>
                    </Card>
                    <Card>
                        <p>Completed Orders</p>
                        <h1 className="text-3xl font-bold">
                            {data.completed_orders}
                        </h1>
                    </Card>
                </div>
                <div className="flex flex-col gap-5 justify-between">
                    <Card>
                        <p>Work Center Efficiency</p>
                        <h1 className="text-3xl font-bold">
                            Chart Placeholder
                        </h1>
                    </Card>
                    <Card>
                        <p>Production Trends</p>
                        <h1 className="text-3xl font-bold">
                            Chart Placeholder
                        </h1>
                    </Card>
                </div>
            </div>
            <Card>
                <p>Production Trends</p>
                <h1 className="text-3xl font-bold">Chart Placeholder</h1>
            </Card>
        </div>
    );
}
