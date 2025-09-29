"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

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

export function OrderChangeModal({
    isOpen,
    onClose,
    order,
}: OrderChangeModalProps) {
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

    const resetForm = useCallback(() => {
        setChangeType("");
        setNewValue("");
        setReason("");
    }, []);

    const handleSubmit = useCallback(() => {
        if (!changeType || !newValue) return;

        const fieldMapping: Record<string, string> = {
            QUANTITY: "quantity",
            DATE: "dueDate",
            PRIORITY: "priority",
            ROUTING: "routingId",
            DESCRIPTION: "description",
        };

        const changeData: ChangeRequest = {
            order_id: order.orderId,
            change_type: changeType,
            field_name: fieldMapping[changeType],
            new_value: newValue,
            reason: reason || undefined,
        };

        changeOrderMutation.mutate(changeData);
    }, [changeType, newValue, order.orderId, reason, changeOrderMutation]);

    const getCurrentValue = useCallback(() => {
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
    }, [changeType, order]);

    const renderValueInput = () => {
        switch (changeType) {
            case "QUANTITY":
                return (
                    <Input
                        type="number"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewValue(e.target.value)
                        }
                        placeholder="Enter new quantity"
                        min="1"
                    />
                );
            case "DATE":
                return (
                    <Input
                        type="datetime-local"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewValue(e.target.value)
                        }
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewValue(e.target.value)
                        }
                        placeholder="Enter routing ID (e.g., RT001)"
                    />
                );
            case "DESCRIPTION":
                return (
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setNewValue(e.target.value)
                        }
                        placeholder="Enter new description"
                        rows={3}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Change Production Order
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Modify production order {order.orderId} for{" "}
                        {order.materialId}
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Change Type</Label>
                        <Select
                            value={changeType}
                            onValueChange={setChangeType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select what to change" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="QUANTITY">
                                    Quantity
                                </SelectItem>
                                <SelectItem value="DATE">Due Date</SelectItem>
                                <SelectItem value="PRIORITY">
                                    Priority
                                </SelectItem>
                                <SelectItem value="ROUTING">Routing</SelectItem>
                                <SelectItem value="DESCRIPTION">
                                    Description
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {changeType && (
                        <div className="space-y-2">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">
                                    Current Value:
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {getCurrentValue()}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>New Value</Label>
                                {renderValueInput()}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Reason for Change (Optional)</Label>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={reason}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => setReason(e.target.value)}
                            placeholder="Enter reason for this change..."
                            rows={2}
                        />
                    </div>

                    {changeOrderMutation.isError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">
                                Error:{" "}
                                {changeOrderMutation.error?.message ||
                                    "Failed to change order"}
                            </p>
                        </div>
                    )}

                    {changeOrderMutation.isSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    Order changed successfully!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                !changeType ||
                                !newValue ||
                                changeOrderMutation.isPending
                            }
                        >
                            {changeOrderMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Apply Change
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
