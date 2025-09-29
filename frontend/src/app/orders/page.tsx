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
import { Progress } from "@/components/ui/progress";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Package,
    Search,
    AlertTriangle,
    Clock,
    Play,
    CheckCircle,
    Calendar,
    AlertCircle,
    Edit,
    CheckSquare,
    History,
} from "lucide-react";
import { useState } from "react";
import { OrderChangeModal } from "@/components/OrderChangeModal";
import { OperationConfirmationModal } from "@/components/OperationConfirmationModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";
import CreateOrderModal from "@/components/CreateOrderModal";

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState("all");
    const queryClient = useQueryClient();

    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{
        orderId: string;
        materialId: string;
        quantity: number;
        dueDate: string;
        priority: string;
        routingId?: string;
        description?: string;
    } | null>(null);

    // Modal handlers
    const handleChangeOrder = (order: (typeof orders)[0]) => {
        setSelectedOrder(order);
        setChangeModalOpen(true);
    };

    const handleConfirmOperation = (order: (typeof orders)[0]) => {
        setSelectedOrder(order);
        setConfirmModalOpen(true);
    };

    const handleViewHistory = (order: (typeof orders)[0]) => {
        setSelectedOrder(order);
        setHistoryModalOpen(true);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/production-orders`
            );
            return response.data;
        },
    });

    // Complete order mutation
    const completeMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/production-orders/${orderId}/complete`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
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
                        Error loading production orders
                    </h2>
                    <p className="text-muted-foreground">
                        Please check your connection and try again.
                    </p>
                </div>
            </div>
        );
    }

    const orders = data as Array<{
        id: string;
        orderId: string;
        materialId: string;
        quantity: number;
        status: string;
        priority: string;
        progress: number;
        dueDate: string;
        plant: string;
    }>;

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.materialId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab =
            selectedTab === "all" ||
            (selectedTab === "active" &&
                ["IN_PROGRESS", "STARTED"].includes(order.status)) ||
            (selectedTab === "completed" && order.status === "COMPLETED") ||
            (selectedTab === "pending" && order.status === "PENDING");

        return matchesSearch && matchesTab;
    });

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return CheckCircle;
            case "in_progress":
            case "started":
                return Play;
            case "pending":
                return Clock;
            default:
                return AlertCircle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "in_progress":
            case "started":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "medium":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const statusCounts = {
        all: orders.length,
        active: orders.filter((o) =>
            ["IN_PROGRESS", "STARTED"].includes(o.status)
        ).length,
        completed: orders.filter((o) => o.status === "COMPLETED").length,
        pending: orders.filter((o) => o.status === "PENDING").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-3 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Production Orders
                    </h1>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <CreateOrderModal />
            </div>

            <Card className="shadow-md">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger
                            value="all"
                            className="flex items-center gap-2"
                        >
                            All ({statusCounts.all})
                        </TabsTrigger>
                        <TabsTrigger
                            value="active"
                            className="flex items-center gap-2"
                        >
                            <Play className="h-4 w-4" />
                            Active ({statusCounts.active})
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="flex items-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Completed ({statusCounts.completed})
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="flex items-center gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Pending ({statusCounts.pending})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedTab} className="mt-6">
                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead className="font-semibold">
                                            Order ID
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Material
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Quantity
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Priority
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Progress
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Due Date
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const StatusIcon = getStatusIcon(
                                            order.status
                                        );
                                        const overdue = isOverdue(
                                            order.dueDate
                                        );

                                        return (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {order.orderId}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {order.materialId}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Plant: {order.plant}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {order.quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(
                                                            order.status
                                                        )}
                                                    >
                                                        <StatusIcon className="h-4 w-4 mr-1" />
                                                        {order.status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getPriorityColor(
                                                            order.priority
                                                        )}
                                                    >
                                                        {order.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-full max-w-xs">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium">
                                                                {order.progress}
                                                                %
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={
                                                                order.progress
                                                            }
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className={`flex items-center gap-2 ${
                                                            overdue
                                                                ? "text-destructive"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            {new Date(
                                                                order.dueDate
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        {overdue && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="text-xs"
                                                            >
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-2"
                                                            title="Change Order (CO02)"
                                                            onClick={() =>
                                                                handleChangeOrder(
                                                                    order
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        {order.status ===
                                                            "IN_PROGRESS" && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-2"
                                                                title="Confirm Operations (CO11N)"
                                                                onClick={() =>
                                                                    handleConfirmOperation(
                                                                        order
                                                                    )
                                                                }
                                                            >
                                                                <CheckSquare className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-2"
                                                            title="View History"
                                                            onClick={() =>
                                                                handleViewHistory(
                                                                    order
                                                                )
                                                            }
                                                        >
                                                            <History className="h-3 w-3" />
                                                        </Button>
                                                        {order.status !==
                                                            "COMPLETED" && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-2"
                                                                title="Complete Order (Auto GI/GR)"
                                                                onClick={() =>
                                                                    completeMutation.mutate(
                                                                        order.orderId
                                                                    )
                                                                }
                                                                disabled={
                                                                    completeMutation.isPending
                                                                }
                                                            >
                                                                {completeMutation.isPending
                                                                    ? "Completing..."
                                                                    : "Complete"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No orders found
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchTerm
                                        ? "Try adjusting your search criteria"
                                        : "Start by creating your first production order"}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Modal Components */}
            {selectedOrder && (
                <>
                    <OrderChangeModal
                        isOpen={changeModalOpen}
                        onClose={() => setChangeModalOpen(false)}
                        order={selectedOrder}
                    />
                    <OperationConfirmationModal
                        isOpen={confirmModalOpen}
                        onClose={() => setConfirmModalOpen(false)}
                        order={selectedOrder}
                    />
                </>
            )}

            <OrderHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                orderId={selectedOrder?.orderId || ""}
            />
        </div>
    );
}
