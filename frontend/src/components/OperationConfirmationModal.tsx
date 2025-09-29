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
import { CheckSquare, CheckCircle, Loader2 } from "lucide-react";

interface OperationConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        orderId: string;
        materialId: string;
        quantity: number;
        routingId?: string;
    };
}

interface ConfirmationRequest {
    order_id: string;
    operation_id: string;
    work_center_id: string;
    yield_qty: number;
    scrap_qty: number;
    setup_time_actual: number;
    machine_time_actual: number;
    labor_time_actual: number;
    start_time: string;
    end_time: string;
    confirmation_type: string;
}

export function OperationConfirmationModal({
    isOpen,
    onClose,
    order,
}: OperationConfirmationModalProps) {
    const [operationId, setOperationId] = useState<string>("0010");
    const [workCenterId, setWorkCenterId] = useState<string>("WC001");
    const [yieldQty, setYieldQty] = useState<string>("");
    const [scrapQty, setScrapQty] = useState<string>("0");
    const [setupTime, setSetupTime] = useState<string>("");
    const [machineTime, setMachineTime] = useState<string>("");
    const [laborTime, setLaborTime] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [confirmationType, setConfirmationType] = useState<string>("PARTIAL");

    const queryClient = useQueryClient();

    const confirmOperationMutation = useMutation({
        mutationFn: async (confirmationData: ConfirmationRequest) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operation-confirmations`,
                confirmationData
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
        setOperationId("0010");
        setWorkCenterId("WC001");
        setYieldQty("");
        setScrapQty("0");
        setSetupTime("");
        setMachineTime("");
        setLaborTime("");
        setStartTime("");
        setEndTime("");
        setConfirmationType("PARTIAL");
    }, []);

    const handleSubmit = useCallback(() => {
        if (
            !operationId ||
            !workCenterId ||
            !yieldQty ||
            !startTime ||
            !endTime
        )
            return;

        const startDateTime = new Date(startTime).toISOString();
        const endDateTime = new Date(endTime).toISOString();

        const confirmationData: ConfirmationRequest = {
            order_id: order.orderId,
            operation_id: operationId,
            work_center_id: workCenterId,
            yield_qty: parseFloat(yieldQty),
            scrap_qty: parseFloat(scrapQty) || 0,
            setup_time_actual: parseFloat(setupTime) || 0,
            machine_time_actual: parseFloat(machineTime) || 0,
            labor_time_actual: parseFloat(laborTime) || 0,
            start_time: startDateTime,
            end_time: endDateTime,
            confirmation_type: confirmationType,
        };

        confirmOperationMutation.mutate(confirmationData);
    }, [
        operationId,
        workCenterId,
        yieldQty,
        scrapQty,
        setupTime,
        machineTime,
        laborTime,
        startTime,
        endTime,
        confirmationType,
        order.orderId,
        confirmOperationMutation,
    ]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                {/* Content goes here */}
            </DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Confirm Operation (CO11N)
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Record operation confirmation for order {order.orderId}
                </p>
            </DialogHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Operation ID</Label>
                        <Select
                            value={operationId}
                            onValueChange={setOperationId}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0010">
                                    0010 - Component Preparation
                                </SelectItem>
                                <SelectItem value="0020">
                                    0020 - Main Assembly
                                </SelectItem>
                                <SelectItem value="0030">
                                    0030 - Quality Testing
                                </SelectItem>
                                <SelectItem value="0040">
                                    0040 - Packaging
                                </SelectItem>
                                <SelectItem value="0050">
                                    0050 - Final Inspection
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Work Center</Label>
                        <Select
                            value={workCenterId}
                            onValueChange={setWorkCenterId}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WC001">
                                    WC001 - Assembly Line 1
                                </SelectItem>
                                <SelectItem value="WC002">
                                    WC002 - Assembly Line 2
                                </SelectItem>
                                <SelectItem value="WC003">
                                    WC003 - Testing Station 1
                                </SelectItem>
                                <SelectItem value="WC005">
                                    WC005 - Packaging Line 1
                                </SelectItem>
                                <SelectItem value="WC007">
                                    WC007 - Component Prep
                                </SelectItem>
                                <SelectItem value="WC008">
                                    WC008 - Final Inspection
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Yield Quantity *</Label>
                        <Input
                            type="number"
                            value={yieldQty}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setYieldQty(e.target.value)}
                            placeholder="Good units produced"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Scrap Quantity</Label>
                        <Input
                            type="number"
                            value={scrapQty}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setScrapQty(e.target.value)}
                            placeholder="Defective units"
                            min="0"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Setup Time (min)</Label>
                        <Input
                            type="number"
                            value={setupTime}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setSetupTime(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Machine Time (min)</Label>
                        <Input
                            type="number"
                            value={machineTime}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setMachineTime(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Labor Time (min)</Label>
                        <Input
                            type="number"
                            value={laborTime}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setLaborTime(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Time *</Label>
                        <Input
                            type="datetime-local"
                            value={startTime}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Time *</Label>
                        <Input
                            type="datetime-local"
                            value={endTime}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Confirmation Type</Label>
                    <Select
                        value={confirmationType}
                        onValueChange={setConfirmationType}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PARTIAL">
                                Partial Confirmation
                            </SelectItem>
                            <SelectItem value="FINAL">
                                Final Confirmation
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {confirmOperationMutation.isError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                            Error:{" "}
                            {confirmOperationMutation.error?.message ||
                                "Failed to confirm operation"}
                        </p>
                    </div>
                )}

                {confirmOperationMutation.isSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Operation confirmed successfully!
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
                            !operationId ||
                            !workCenterId ||
                            !yieldQty ||
                            !startTime ||
                            !endTime ||
                            confirmOperationMutation.isPending
                        }
                    >
                        {confirmOperationMutation.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Confirm Operation
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
