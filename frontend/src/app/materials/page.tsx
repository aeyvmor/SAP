"use client";

import { Card } from "@/components/Card";
import { useMaterials } from "@/hooks/useApi";
import { Material } from "@/lib/api";

export default function Materials() {
  const { data: materials, loading, error } = useMaterials();

  const getStockStatus = (material: Material): string => {
    if (material.currentStock <= 0) return "Out of Stock";
    if (material.currentStock < material.minStock) return "Low Stock";
    return "Available";
  };

  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case "Out of Stock":
        return "text-red-600";
      case "Low Stock":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  const formatPrice = (price: number): string => `$${price}`;

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-10 max-w-7xl">
        <p className="text-xl mr-auto">Material Management</p>
        <Card>
          <div className="text-red-600 text-center py-8">
            <p>Failed to load materials: {error}</p>
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
      <p className="text-xl mr-auto">Material Management</p>

      <Card>
        <table className="min-w-full text-left rounded-2xl overflow-hidden border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Material ID</th>
              <th className="px-4 py-2 border-b">Description</th>
              <th className="px-4 py-2 border-b">Type</th>
              <th className="px-4 py-2 border-b">Current Stock</th>
              <th className="px-4 py-2 border-b">Unit Price</th>
              <th className="px-4 py-2 border-b">Availability Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Loading materials data...
                </td>
              </tr>
            ) : materials && materials.length > 0 ? (
              materials.map((material) => {
                const stockStatus = getStockStatus(material);
                const statusColorClass = getStatusColorClass(stockStatus);

                return (
                  <tr
                    key={material.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 border-b font-mono">
                      {material.materialId}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {material.description}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {material.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b text-right">
                      {material.currentStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b text-right font-mono">
                      {formatPrice(material.unitPrice)}
                    </td>
                    <td
                      className={`px-4 py-2 border-b font-medium ${statusColorClass}`}
                    >
                      {stockStatus}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No materials found in inventory
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
