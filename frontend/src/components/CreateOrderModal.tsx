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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import MaterialCombobox from "@/components/MaterialCombobox";

type OrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface NewOrder {
    material_id: string;
    quantity: number;
    due_date: string;
    priority: OrderPriority;
    description?: string;
    costCenter?: string;
    plant?: string;
}

export default function CreateOrderModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [materialId, setMaterialId] = useState("");
    const queryClient = useQueryClient();

    // Query for materials to populate the combobox
    const { data: materials = [] } = useQuery({
        queryKey: ["materials"],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/materials`
            );
            return response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: (newOrder: NewOrder) => {
            return axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/production-orders`,
                newOrder
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setIsOpen(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setMaterialId("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newOrder: NewOrder = {
            material_id: materialId,
            quantity: parseInt(String(formData.get("quantity") || "0"), 10),
            due_date: String(formData.get("dueDate") || ""),
            priority: String(
                formData.get("priority") || "MEDIUM"
            ) as OrderPriority,
            description: String(formData.get("description") || ""),
            costCenter: String(formData.get("costCenter") || "CC001"),
            plant: String(formData.get("plant") || "1000"),
        };

        mutation.mutate(newOrder);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Production Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="materialId">Material ID</Label>
                        <MaterialCombobox
                            materials={materials}
                            value={materialId}
                            onChange={setMaterialId}
                            placeholder="Select existing material or enter custom Material ID"
                            required
                            id="materialId"
                            name="materialId"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            required
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            name="dueDate"
                            type="datetime-local"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="MEDIUM">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Optional description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="costCenter">Cost Center</Label>
                        <Input
                            id="costCenter"
                            name="costCenter"
                            defaultValue="CC001"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plant">Plant</Label>
                        <Input id="plant" name="plant" defaultValue="1000" />
                    </div>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Creating..." : "Create Order"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
