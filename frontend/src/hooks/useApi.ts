"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const asyncFunctionRef = useRef(asyncFunction);

  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunctionRef.current();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export function useDashboardData() {
  const getDashboardData = useCallback(() => api.getDashboardData(), []);
  return useAsync(getDashboardData);
}

export function useMetrics() {
  const getMetrics = useCallback(
    () => api.getDashboardData().then((data) => data.metrics),
    [],
  );
  return useAsync(getMetrics);
}

export function useMaterials() {
  const getMaterials = useCallback(
    () => api.getDashboardData().then((data) => data.materials),
    [],
  );
  return useAsync(getMaterials);
}

export function useProductionOrders(status?: string) {
  const getOrders = useCallback(
    () =>
      api
        .getDashboardData()
        .then((data) =>
          status
            ? data.orders.filter((order) => order.status === status)
            : data.orders,
        ),
    [status],
  );

  return useAsync(getOrders);
}

export function useProductionOrdersDirect(status?: string) {
  const getOrders = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = `/api/production-orders${
      status ? `?status=${status}` : ""
    }`;

    const response = await fetch(`${apiUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    return response.json();
  }, [status]);

  return useAsync(getOrders);
}

export function useWorkCenterEfficiency() {
  const getWorkCenterEfficiency = useCallback(
    () => api.getWorkCenterEfficiency(),
    [],
  );
  return useAsync(getWorkCenterEfficiency);
}

export function useAutoRefresh<T>(
  asyncFunction: () => Promise<T>,
  intervalMs: number = 30000,
) {
  const { data, loading, error, refetch } = useAsync(asyncFunction);

  useEffect(() => {
    const interval = setInterval(refetch, intervalMs);
    return () => clearInterval(interval);
  }, [refetch, intervalMs]);

  return { data, loading, error, refetch };
}

export function useDashboardWithRefresh(intervalMs: number = 30000) {
  const getDashboardData = useCallback(() => api.getDashboardData(), []);
  return useAutoRefresh(getDashboardData, intervalMs);
}
