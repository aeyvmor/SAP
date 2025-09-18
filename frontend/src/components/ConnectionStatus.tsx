"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className = "" }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      await apiClient.healthCheck();
      setIsConnected(true);
      setLastCheck(new Date());
    } catch {
      setIsConnected(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return "bg-gray-400";
    return isConnected ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = () => {
    if (isConnected === null) return "Checking...";
    return isConnected ? "Connected" : "Disconnected";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm font-medium">{getStatusText()}</span>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
