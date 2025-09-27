"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";

type MaterialType = "RAW" | "SEMI_FINISHED" | "FINISHED" | "CONSUMABLE";

interface NewMaterial {
    material_id: string;
    description: string;
    type: MaterialType;
    unitOfMeasure: string;
    unitPrice: number;
    plant: string;
    storageLocation: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
}

export default function AddMaterialModal() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newMaterial: NewMaterial) => {
            return axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/materials`,
                newMaterial
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            setIsOpen(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newMaterial: NewMaterial = {
            material_id: String(formData.get("materialId") || ""),
            description: String(formData.get("description") || ""),
            type: String(formData.get("type") || "RAW") as MaterialType,
            unitOfMeasure: String(formData.get("unitOfMeasure") || ""),
            unitPrice: parseFloat(String(formData.get("unitPrice") || "0")),
            plant: String(formData.get("plant") || ""),
            storageLocation: String(formData.get("storageLocation") || ""),
            currentStock: parseInt(String(formData.get("currentStock") || "0"), 10),
            minStock: parseInt(String(formData.get("minStock") || "0"), 10),
            maxStock: parseInt(String(formData.get("maxStock") || "0"), 10),
        };

        mutation.mutate(newMaterial);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Material</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="materialId">Material ID</Label>
                        <Input id="materialId" name="materialId" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input id="type" name="type" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currentStock">Current Stock</Label>
                        <Input id="currentStock" name="currentStock" type="number" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minStock">Min Stock</Label>
                        <Input id="minStock" name="minStock" type="number" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxStock">Max Stock</Label>
                        <Input id="maxStock" name="maxStock" type="number" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                        <Input id="unitOfMeasure" name="unitOfMeasure" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unitPrice">Unit Price</Label>
                        <Input id="unitPrice" name="unitPrice" type="number" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" name="status" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plant">Plant</Label>
                        <Input id="plant" name="plant" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="storageLocation">Storage Location</Label>
                        <Input id="storageLocation" name="storageLocation" required />
                    </div>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Adding..." : "Add Material"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}