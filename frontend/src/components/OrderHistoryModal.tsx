"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { History, X, Clock, CheckSquare, Edit, Loader2 } from "lucide-react";

interface OrderHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

interface OrderChange {
    change_id: string;
    order_id: string;
    change_type: string;
    field_name: string;
    old_value: string;
    new_value: string;
    reason?: string;
    changed_by: string;
    change_timestamp: string;
    status: string;
}

interface OperationConfirmation {
    confirmation_id: string;
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
    status: string;
}

export function OrderHistoryModal({ isOpen, onClose, orderId }: OrderHistoryModalProps) {
    // Query for order change history
    const { data: changeHistory, isLoading: loadingChanges } = useQuery({
        queryKey: ["order-changes", orderId],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/order-changes/${orderId}/history`
            );
            return response.data as OrderChange[];
        },
        enabled: isOpen,
    });

    // Query for operation confirmations
    const { data: confirmationDetails, isLoading: loadingConfirmations } = useQuery({
        queryKey: ["operation-confirmations", orderId],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/operation-confirmations/order/${orderId}`
            );
            return response.data;
        },
        enabled: isOpen,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Order History & Confirmations
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Complete history for order {orderId}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <Tabs defaultValue="changes">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="changes" className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Change History ({changeHistory?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="confirmations" className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" />
                                Confirmations ({confirmationDetails?.confirmations?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        {/* Change History Tab */}
                        <TabsContent value="changes" className="mt-4">
                            {loadingChanges ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Change ID</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Field</TableHead>
                                                <TableHead>Old Value</TableHead>
                                                <TableHead>New Value</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Changed By</TableHead>
                                                <TableHead>Timestamp</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {changeHistory?.map((change) => (
                                                <TableRow key={change.change_id}>
                                                    <TableCell className="font-medium">
                                                        {change.change_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{change.change_type}</Badge>
                                                    </TableCell>
                                                    <TableCell>{change.field_name}</TableCell>
                                                    <TableCell className="text-red-600">
                                                        {change.old_value || "None"}
                                                    </TableCell>
                                                    <TableCell className="text-green-600 font-medium">
                                                        {change.new_value}
                                                    </TableCell>
                                                    <TableCell>{change.reason || "-"}</TableCell>
                                                    <TableCell>{change.changed_by}</TableCell>
                                                    <TableCell>
                                                        {new Date(change.change_timestamp).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {(!changeHistory || changeHistory.length === 0) && (
                                        <div className="text-center py-8">
                                            <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No Changes</h3>
                                            <p className="text-gray-600">No changes have been made to this order</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Operation Confirmations Tab */}
                        <TabsContent value="confirmations" className="mt-4">
                            {loadingConfirmations ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    {confirmationDetails?.summary && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Yield</p>
                                                <p className="font-semibold">{confirmationDetails.summary.total_yield}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Scrap</p>
                                                <p className="font-semibold">{confirmationDetails.summary.total_scrap}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Yield Efficiency</p>
                                                <p className="font-semibold">{confirmationDetails.summary.yield_efficiency?.toFixed(1)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Time Efficiency</p>
                                                <p className="font-semibold">{confirmationDetails.summary.time_efficiency?.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirmations Table */}
                                    <div className="rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Confirmation ID</TableHead>
                                                    <TableHead>Operation</TableHead>
                                                    <TableHead>Work Center</TableHead>
                                                    <TableHead>Yield/Scrap</TableHead>
                                                    <TableHead>Actual Times</TableHead>
                                                    <TableHead>Period</TableHead>
                                                    <TableHead>Type</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {confirmationDetails?.confirmations?.map((conf: OperationConfirmation) => (
                                                    <TableRow key={conf.confirmation_id}>
                                                        <TableCell className="font-medium">
                                                            {conf.confirmation_id}
                                                        </TableCell>
                                                        <TableCell>{conf.operation_id}</TableCell>
                                                        <TableCell>{conf.work_center_id}</TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <span className="text-green-600">{conf.yield_qty} yield</span>
                                                                {conf.scrap_qty > 0 && (
                                                                    <span className="text-red-600 ml-2">{conf.scrap_qty} scrap</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs">
                                                                <div>Setup: {conf.setup_time_actual}min</div>
                                                                <div>Machine: {conf.machine_time_actual}min</div>
                                                                <div>Labor: {conf.labor_time_actual}min</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs">
                                                                <div>{new Date(conf.start_time).toLocaleString()}</div>
                                                                <div>to</div>
                                                                <div>{new Date(conf.end_time).toLocaleString()}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={conf.confirmation_type === "FINAL" ? "default" : "secondary"}>
                                                                {conf.confirmation_type}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {(!confirmationDetails?.confirmations || confirmationDetails.confirmations.length === 0) && (
                                            <div className="text-center py-8">
                                                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Confirmations</h3>
                                                <p className="text-gray-600">No operations have been confirmed for this order</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t">
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}