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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Calculator,
  Play,
  Package,
  ShoppingCart,
  CheckCircle,
  FileText,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useState } from "react";

interface MRPRunResponse {
  run_id: string;
  planning_horizon_days: number;
  plant: string;
  materials_processed: number;
  planned_orders_created: number;
  purchase_reqs_created: number;
  exceptions: string[];
  run_timestamp: string;
}

interface PlannedOrder {
  id: number;
  planned_order_id: string;
  material_id: string;
  quantity: number;
  due_date: string;
  start_date: string;
  plant: string;
  order_type: string;
  status: string;
  created_by_mrp_run: string;
  created_at: string;
}

interface PurchaseRequisition {
  id: number;
  pr_number: string;
  material_id: string;
  quantity: number;
  delivery_date: string;
  plant: string;
  status: string;
  created_by_mrp_run: string;
  created_at: string;
}

interface MRPRunHistory {
  run_id: string;
  plant: string;
  run_timestamp: string;
  planned_orders_created: number;
  purchase_reqs_created: number;
}

export default function MRPPage() {
  const [planningHorizon, setPlanningHorizon] = useState(90);
  const [plant, setPlant] = useState("1000");
  const queryClient = useQueryClient();

  // Query for planned orders
  const { data: plannedOrders, isLoading: loadingPlanned } = useQuery({
    queryKey: ["planned-orders"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/planned-orders`,
      );
      return response.data as PlannedOrder[];
    },
  });

  // Query for purchase requisitions
  const { data: purchaseReqs, isLoading: loadingPurchase } = useQuery({
    queryKey: ["purchase-requisitions"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/purchase-requisitions`,
      );
      return response.data as PurchaseRequisition[];
    },
  });

  // Query for MRP run history
  const { data: mrpHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["mrp-history"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/runs/history`,
      );
      return response.data as MRPRunHistory[];
    },
  });

  // Mutation for running MRP
  const runMRPMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/run`,
        {
          planning_horizon_days: planningHorizon,
          plant: plant,
          create_planned_orders: true,
          create_purchase_reqs: true,
        },
      );
      return response.data as MRPRunResponse;
    },
    onSuccess: () => {
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ["planned-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["mrp-history"] });
    },
  });

  // Mutation for converting planned order to production order
  const convertOrderMutation = useMutation({
    mutationFn: async (plannedOrderId: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/planned-orders/${plannedOrderId}/convert`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Mutation for receiving goods from purchase requisition
  const receiveGoodsMutation = useMutation({
    mutationFn: async (prNumber: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mrp/purchase-requisitions/${prNumber}/receive-goods`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  const handleRunMRP = () => {
    runMRPMutation.mutate();
  };

  const handleConvertOrder = (plannedOrderId: string) => {
    convertOrderMutation.mutate(plannedOrderId);
  };

  const handleReceiveGoods = (prNumber: string) => {
    receiveGoodsMutation.mutate(prNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-3 rounded-lg">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            MRP Planning (MD01)
          </h1>
          <p className="text-muted-foreground">
            Material Requirements Planning and Order Generation
          </p>
        </div>
      </div>

      {/* MRP Run Controls */}
      <Card className="shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Play className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Run MRP</h2>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium mb-2 block">
              Planning Horizon (Days)
            </label>
            <Input
              type="number"
              value={planningHorizon}
              onChange={(e) => setPlanningHorizon(Number(e.target.value))}
              min="1"
              max="365"
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium mb-2 block">Plant</label>
            <Input
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              placeholder="Plant code"
            />
          </div>
          <Button
            onClick={handleRunMRP}
            disabled={runMRPMutation.isPending}
            className="flex items-center gap-2"
          >
            {runMRPMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run MRP
          </Button>
        </div>

        {/* MRP Run Results */}
        {runMRPMutation.data && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                MRP Run Completed: {runMRPMutation.data.run_id}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Materials Processed</p>
                <p className="font-semibold">
                  {runMRPMutation.data.materials_processed}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Planned Orders</p>
                <p className="font-semibold">
                  {runMRPMutation.data.planned_orders_created}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Purchase Reqs</p>
                <p className="font-semibold">
                  {runMRPMutation.data.purchase_reqs_created}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Exceptions</p>
                <p className="font-semibold">
                  {runMRPMutation.data.exceptions.length}
                </p>
              </div>
            </div>
            {runMRPMutation.data.exceptions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-orange-600 mb-2">
                  Exceptions:
                </p>
                <div className="max-h-32 overflow-y-auto">
                  {runMRPMutation.data.exceptions
                    .slice(0, 5)
                    .map((exception, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {exception}
                      </p>
                    ))}
                  {runMRPMutation.data.exceptions.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {runMRPMutation.data.exceptions.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* MRP Results Tabs */}
      <Card className="shadow-md">
        <Tabs defaultValue="planned-orders">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="planned-orders"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Planned Orders ({plannedOrders?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="purchase-reqs"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase Reqs ({purchaseReqs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Run History ({mrpHistory?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Planned Orders Tab */}
          <TabsContent value="planned-orders" className="mt-6">
            {loadingPlanned ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Planned Order ID</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plannedOrders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.planned_order_id}
                        </TableCell>
                        <TableCell>{order.material_id}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {new Date(order.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "PLANNED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === "PLANNED" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleConvertOrder(order.planned_order_id)
                              }
                              disabled={convertOrderMutation.isPending}
                            >
                              Convert to Production Order
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!plannedOrders || plannedOrders.length === 0) && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Planned Orders
                    </h3>
                    <p className="text-muted-foreground">
                      Run MRP to generate planned orders
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Purchase Requisitions Tab */}
          <TabsContent value="purchase-reqs" className="mt-6">
            {loadingPurchase ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PR Number</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseReqs?.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          {req.pr_number}
                        </TableCell>
                        <TableCell>{req.material_id}</TableCell>
                        <TableCell>{req.quantity}</TableCell>
                        <TableCell>
                          {new Date(req.delivery_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              req.status === "OPEN"
                                ? "default"
                                : req.status === "RECEIVED"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {req.status === "OPEN" && (
                            <Button
                              size="sm"
                              onClick={() => handleReceiveGoods(req.pr_number)}
                              disabled={receiveGoodsMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              Receive Goods
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!purchaseReqs || purchaseReqs.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Purchase Requisitions
                    </h3>
                    <p className="text-muted-foreground">
                      Run MRP to generate purchase requisitions
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* MRP Run History Tab */}
          <TabsContent value="history" className="mt-6">
            {loadingHistory ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run ID</TableHead>
                      <TableHead>Plant</TableHead>
                      <TableHead>Run Time</TableHead>
                      <TableHead>Planned Orders</TableHead>
                      <TableHead>Purchase Reqs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mrpHistory?.map((run: MRPRunHistory) => (
                      <TableRow key={run.run_id}>
                        <TableCell className="font-medium">
                          {run.run_id}
                        </TableCell>
                        <TableCell>{run.plant}</TableCell>
                        <TableCell>
                          {new Date(run.run_timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {run.planned_orders_created}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {run.purchase_reqs_created}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!mrpHistory || mrpHistory.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No MRP Runs</h3>
                    <p className="text-muted-foreground">
                      MRP run history will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
