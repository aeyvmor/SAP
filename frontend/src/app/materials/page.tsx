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
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function MaterialsPage() {
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
        id: number;
        materialId: string;
        description: string;
        type: string;
        currentStock: number;
        minStock: number;
        maxStock: number;
        unitOfMeasure: string;
        unitPrice: number;
        status: string;
        plant: string;
        storageLocation: string;
    }>;

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Materials</h2>
                <Button>Add New Material</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materials.map((material) => (
                        <TableRow key={material.id}>
                            <TableCell>{material.materialId}</TableCell>
                            <TableCell>{material.description}</TableCell>
                            <TableCell>{material.type}</TableCell>
                            <TableCell>{material.currentStock}</TableCell>
                            <TableCell>
                                ${material.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge>{material.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
