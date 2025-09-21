"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle, Loader2, X } from "lucide-react";

interface OrderChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        orderId: string;
        materialId: string;
        quantity: number;
        dueDate: string;
        priority: string;
        routingId?: string;
        description?: string;
    };
}

interface ChangeRequest {
    order_id: string;
    change_type: string;
    field_name: string;
    new_value: string;
    reason?: string;
}

export function OrderChangeModal({ isOpen, onClose, order }: OrderChangeModalProps) {
    const [changeType, setChangeType] = useState<string>("");
    const [newValue, setNewValue] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const queryClient = useQueryClient();

    const changeOrderMutation = useMutation({
        mutationFn: async (changeData: ChangeRequest) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/order-changes/${order.orderId}/change`,
                changeData
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            onClose();
            resetForm();
        },
    });

    const resetForm = () => {
        setChangeType("");
        setNewValue("");
        setReason("");
    };

    const handleSubmit = () => {
        if (!changeType || !newValue) return;

        const fieldMapping: Record<string, string> = {
            "QUANTITY": "quantity",
            "DATE": "dueDate",
            "PRIORITY": "priority",
            "ROUTING": "routingId",
            "DESCRIPTION": "description"
        };

        const changeData: ChangeRequest = {
            order_id: order.orderId,
            change_type: changeType,
            field_name: fieldMapping[changeType],
            new_value: newValue,
            reason: reason || undefined
        };

        changeOrderMutation.mutate(changeData);
    };

    const getCurrentValue = () => {
        switch (changeType) {
            case "QUANTITY":
                return order.quantity.toString();
            case "DATE":
                return order.dueDate;
            case "PRIORITY":
                return order.priority;
            case "ROUTING":
                return order.routingId || "";
            case "DESCRIPTION":
                return order.description || "";
            default:
                return "";
        }
    };

    const renderValueInput = () => {
        switch (changeType) {
            case "QUANTITY":
                return (
                    <Input
                        type="number"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
                        placeholder="Enter new quantity"
                        min="1"
                    />
                );
            case "DATE":
                return (
                    <Input
                        type="datetime-local"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
                    />
                );
            case "PRIORITY":
                return (
                    <Select value={newValue} onValueChange={setNewValue}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case "ROUTING":
                return (
                    <Input
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
                        placeholder="Enter routing ID (e.g., RT001)"
                    />
                );
            case "DESCRIPTION":
                return (
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md resize-none"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewValue(e.target.value)}
                        placeholder="Enter new description"
                        rows={3}
                    />
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Change Production Order
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Modify production order {order.orderId} for {order.materialId}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Change Type</label>
                        <Select value={changeType} onValueChange={setChangeType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select what to change" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="QUANTITY">Quantity</SelectItem>
                                <SelectItem value="DATE">Due Date</SelectItem>
                                <SelectItem value="PRIORITY">Priority</SelectItem>
                                <SelectItem value="ROUTING">Routing</SelectItem>
                                <SelectItem value="DESCRIPTION">Description</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {changeType && (
                        <div className="space-y-2">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-medium">Current Value:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{getCurrentValue()}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">New Value</label>
                                {renderValueInput()}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Reason for Change (Optional)</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            placeholder="Enter reason for this change..."
                            rows={2}
                        />
                    </div>

                    {changeOrderMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                Error: {changeOrderMutation.error?.message || "Failed to change order"}
                            </p>
                        </div>
                    )}

                    {changeOrderMutation.isSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <p className="text-sm text-green-800">
                                    Order changed successfully!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-6 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={!changeType || !newValue || changeOrderMutation.isPending}
                    >
                        {changeOrderMutation.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Apply Change
                    </Button>
                </div>
            </div>
        </div>
    );
}