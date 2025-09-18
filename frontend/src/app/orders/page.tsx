"use client";

import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProductionOrdersDirect } from "@/hooks/useApi";
import { ProductionOrder, apiClient } from "@/lib/api";
import { useState } from "react";

interface CreateOrderForm {
  material_id: string;
  quantity: number;
  due_date: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  description?: string;
}

function CreateOrderModal({ onOrderCreated }: { onOrderCreated: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState<CreateOrderForm>({
    material_id: "",
    quantity: 1,
    due_date: "",
    priority: "MEDIUM",
    description: "",
  });

  const resetForm = () => {
    setOrderForm({
      material_id: "",
      quantity: 1,
      due_date: "",
      priority: "MEDIUM",
      description: "",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dueDateISO = new Date(
        orderForm.due_date + "T23:59:59",
      ).toISOString();

      await apiClient.createProductionOrder({
        material_id: orderForm.material_id,
        quantity: orderForm.quantity,
        due_date: dueDateISO,
        priority: orderForm.priority,
        description: orderForm.description || undefined,
      });

      setIsModalOpen(false);
      resetForm();
      onOrderCreated();
    } catch (error) {
      console.error("Failed to create production order:", error);
      alert("Failed to create order. Please check your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormField = <K extends keyof CreateOrderForm>(
    field: K,
    value: CreateOrderForm[K],
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const minimumDate = tomorrowDate.toISOString().split("T")[0];

  return (
    <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-xl">Create New Order</Button>
      </SheetTrigger>
      <SheetContent className="p-5">
        <SheetHeader>
          <SheetTitle>Create Production Order</SheetTitle>
          <SheetDescription>
            Submit a new order for manufacturing. All fields marked with * are
            required.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="material_id">Material ID / Model Name *</Label>
            <Input
              id="material_id"
              value={orderForm.material_id}
              onChange={(e) => updateFormField("material_id", e.target.value)}
              placeholder="Enter material ID or model name (e.g., IPHONE15PRO256)"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={orderForm.quantity}
              onChange={(e) =>
                updateFormField("quantity", parseInt(e.target.value) || 1)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              min={minimumDate}
              value={orderForm.due_date}
              onChange={(e) => updateFormField("due_date", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority Level *</Label>
            <select
              id="priority"
              value={orderForm.priority}
              onChange={(e) =>
                updateFormField(
                  "priority",
                  e.target.value as "LOW" | "MEDIUM" | "HIGH",
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Order Description (Optional)</Label>
            <Input
              id="description"
              value={orderForm.description}
              onChange={(e) => updateFormField("description", e.target.value)}
              placeholder="Enter additional order details"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function ProductionOrdersPage() {
  const {
    data: productionOrders,
    loading,
    error,
    refetch,
  } = useProductionOrdersDirect();

  const formatOrderDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOrderStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "RELEASED":
        return "text-yellow-600";
      case "CREATED":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const handleOrderCreated = () => {
    refetch();
  };

  const handleReleaseOrder = async (orderId: string) => {
    try {
      console.log("Releasing order:", orderId);
      const result = await apiClient.releaseProductionOrder(orderId);
      console.log("Release result:", result);
      alert("Order released successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to release order:", error);
      // Don't show error alert since the operation might have succeeded
      // Just log it and refetch to see if it actually worked
      refetch();
    }
  };

  const handleCompleteOrder = async (orderId: string, quantity: number) => {
    try {
      console.log("Completing order:", orderId, "quantity:", quantity);
      const result = await apiClient.completeProductionOrder(orderId, quantity);
      console.log("Complete result:", result);
      alert("Order completed successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to complete order:", error);
      // Don't show error alert since the operation might have succeeded
      // Just log it and refetch to see if it actually worked
      refetch();
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-10 max-w-7xl">
        <div className="flex flex-1">
          <p className="text-xl mr-auto">Production Orders</p>
          <CreateOrderModal onOrderCreated={handleOrderCreated} />
        </div>

        <Card>
          <div className="text-red-600 text-center py-8">
            <p>Failed to load production orders: {error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please check your connection and try again
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-10 max-w-7xl">
      <div className="flex flex-1">
        <p className="text-xl mr-auto">Production Orders</p>
        <CreateOrderModal onOrderCreated={handleOrderCreated} />
      </div>

      <div className="flex flex-col gap-5">
        {loading ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              Loading production orders...
            </div>
          </Card>
        ) : productionOrders && productionOrders.length > 0 ? (
          productionOrders.map((order: ProductionOrder) => (
            <Card key={order.id}>
              <p className="text-2xl font-bold">{order.orderId}</p>

              <p className={getOrderStatusColor(order.status || 'UNKNOWN')}>
                {order.status || 'Unknown'} • {order.priority || 'Unknown'} Priority
              </p>

              <p className="text-gray-700">
                {order.description || `Material: ${order.materialId}`}
              </p>

              <p className="text-sm text-gray-600">
                Quantity: {order.quantity.toLocaleString()} • Due:{" "}
                {order.dueDate ? formatOrderDate(order.dueDate) : 'Not set'}
              </p>

              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">
                  Progress: {order.progress}%
                </p>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-zinc-700 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {order.status === "CREATED" && (
                  <Button
                    size="sm"
                    onClick={() => handleReleaseOrder(order.orderId)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Release Order
                  </Button>
                )}
                {(order.status === "CREATED" || order.status === "RELEASED") && (
                  <Button
                    size="sm"
                    onClick={() => handleCompleteOrder(order.orderId, order.quantity)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Order
                  </Button>
                )}
                {order.status === "COMPLETED" && (
                  <Button size="sm" disabled className="bg-gray-500">
                    ✓ Completed
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <p>No production orders found</p>
              <p className="text-sm mt-1">
                Create your first order using the button above
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
