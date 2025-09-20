"use client";

import { Card } from "@/components/Card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Home() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["materials"],
        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:8000/api/materials"
            );
            return response.data;
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading materials</div>;
    }

    const materials = data as Array<{
        id: string;
        description: string;
        type: string;
        stock: number;
        price: number;
        status: string;
    }>;

    return (
        <div className="flex flex-1 flex-col gap-10 max-w-7xl">
            <p className="text-xl mr-auto">Material Management</p>
            <Card>
                <table className="min-w-full text-left rounded-2xl overflow-hidden border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border-b">Material ID</th>
                            <th className="px-4 py-2 border-b">Description</th>
                            <th className="px-4 py-2 border-b">Type</th>
                            <th className="px-4 py-2 border-b">Stock</th>
                            <th className="px-4 py-2 border-b">Unit Price</th>
                            <th className="px-4 py-2 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((material) => (
                            <tr key={material.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">
                                    {material.id}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.description}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.type}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.stock}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    ${material.price}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {material.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
