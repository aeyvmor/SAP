"use client";

import { Card } from "@/components/Card";
import {
  useDashboardWithRefresh,
  useWorkCenterEfficiency,
} from "@/hooks/useApi";

export default function Dashboard() {
  const { data: dashboardData, loading } = useDashboardWithRefresh(30000);
  const { data: workCenterData, loading: wcLoading } =
    useWorkCenterEfficiency();

  const metrics = dashboardData?.metrics;
  const insights = dashboardData?.insights;

  const avgEfficiency = workCenterData?.length
    ? workCenterData.reduce((sum, wc) => sum + (wc.efficiency || 0), 0) /
      workCenterData.length
    : 0;

  const formatCurrency = (value: number) => Math.round(value).toLocaleString();

  const showValue = (
    isLoading: boolean,
    value: string | number | undefined,
    fallback = "0",
  ) => (isLoading ? "Loading..." : (value ?? fallback));

  return (
    <div className="flex flex-col gap-10 max-w-7xl">
      <div className="flex flex-1 flex-row gap-5">
        <div className="flex flex-1 flex-col gap-5">
          <Card>
            <p>Total Production</p>
            <h1 className="text-3xl font-bold">
              {showValue(
                loading,
                insights?.totalMaterialValue
                  ? formatCurrency(insights.totalMaterialValue)
                  : "0",
              )}
            </h1>
          </Card>

          <Card>
            <p>Efficiency Rate</p>
            <h1 className="text-3xl font-bold">
              {showValue(wcLoading, `${Math.round(avgEfficiency)}%`)}
            </h1>
          </Card>

          <Card>
            <p>Active Orders</p>
            <h1 className="text-3xl font-bold">
              {showValue(loading, metrics?.active_orders)}
            </h1>
          </Card>

          <Card>
            <p>Completed Orders</p>
            <h1 className="text-3xl font-bold">
              {showValue(loading, metrics?.completed_orders)}
            </h1>
          </Card>
        </div>

        <div className="flex flex-col gap-5 justify-between">
          <Card>
            <p>Work Center Efficiency</p>
            <h1 className="text-3xl font-bold">idk chart here</h1>
          </Card>

          <Card>
            <p>Production Trends</p>
            <h1 className="text-3xl font-bold">idk chart here</h1>
          </Card>
        </div>
      </div>

      <Card>
        <p>Production Trends</p>
        <h1 className="text-3xl font-bold">idk chart here</h1>
      </Card>
    </div>
  );
}
