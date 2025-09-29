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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Package,
    Search,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import { useState } from "react";
import AddMaterialModal from "@/components/AddMaterialModal";

export default function MaterialsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["materials"],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/materials`
            );
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <Skeleton className="h-64 w-full" />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        Error loading materials
                    </h2>
                    <p className="text-muted-foreground">
                        Please check your connection and try again.
                    </p>
                </div>
            </div>
        );
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

    const filteredMaterials = materials.filter(
        (material) =>
            material.materialId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            material.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            material.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (current: number, min: number, max: number) => {
        if (current <= min)
            return { status: "Low", color: "destructive", icon: TrendingDown };
        if (current >= max)
            return { status: "High", color: "default", icon: TrendingUp };
        return { status: "Normal", color: "secondary", icon: Minus };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "inactive":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-3 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Materials Management
                    </h1>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <AddMaterialModal />
            </div>

            <Card className="shadow-md">
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                                <TableHead className="font-semibold">
                                    Material ID
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Description
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Type
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Stock Status
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Current Stock
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Unit Price
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMaterials.map((material) => {
                                const stockStatus = getStockStatus(
                                    material.currentStock,
                                    material.minStock,
                                    material.maxStock
                                );
                                const StockIcon = stockStatus.icon;

                                return (
                                    <TableRow
                                        key={material.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium">
                                            {material.materialId}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div>
                                                <p className="font-medium">
                                                    {material.description}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {material.plant} •{" "}
                                                    {material.storageLocation}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {material.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    stockStatus.color ===
                                                    "destructive"
                                                        ? "destructive"
                                                        : stockStatus.color ===
                                                          "secondary"
                                                        ? "secondary"
                                                        : "default"
                                                }
                                            >
                                                <StockIcon className="h-4 w-4" />
                                                {stockStatus.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {material.currentStock}{" "}
                                                    {material.unitOfMeasure}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Min: {material.minStock} •
                                                    Max: {material.maxStock}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                ${material.unitPrice.toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusColor(
                                                    material.status
                                                )}
                                            >
                                                {material.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {filteredMaterials.length === 0 && (
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No materials found
                        </h3>
                        <p className="text-muted-foreground">
                            {searchTerm
                                ? "Try adjusting your search criteria"
                                : "Start by adding your first material"}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
