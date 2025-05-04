import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import fetchData from "@/components/services/fetcher";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_KEY =
  typeof window !== "undefined"
    ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
    : null;
const TABLE_NAME = "admin_sys_stats";
console.log(API_KEY);

export default function SystemMonitor() {
  const [stats, setStats] = useState<Array<any>>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const maxDataPoints = 20;
  const isFetching = useRef(false); // Use ref instead of state to track ongoing fetch

  useEffect(() => {
    const fetchStats = async () => {
      if (isFetching.current) return; // Prevent multiple fetch requests

      isFetching.current = true; // Mark as fetching
      try {
        console.log("Refreshing");
        const data = await fetchData(TABLE_NAME, API_KEY);

        // Reset error state on successful fetch
        setApiError(null);

        if (Array.isArray(data)) {
          const newStats = data.slice(-maxDataPoints).map((entry) => ({
            time: Math.floor(new Date(entry.timestamp).getTime() / 1000),
            cpu: entry.cpu_usage,
            ram: entry.ram_usage,
            storage: entry.storage_usage,
          }));

          setStats((prevStats) => {
            if (JSON.stringify(prevStats) !== JSON.stringify(newStats)) {
              return newStats;
            }
            return prevStats;
          });
        }
      } catch (error: any) {
        console.error("Error fetching system stats:", error);

        // Check for API key related errors
        if (error.status === 401 || error.status === 403) {
          setApiError(
            "API key invalid or expired. Please update your API key.",
          );
        } else if (!API_KEY) {
          setApiError("No API key found. Please provide a valid API key.");
        } else {
          setApiError(
            `Error fetching data: ${error.message || "Unknown error"}`,
          );
        }
      } finally {
        isFetching.current = false; // Allow next request
      }
    };

    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 w-full">
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <AlertTitle>API Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setApiError(null)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}
      <h2 className="text-xl font-bold mb-2">System Usage</h2>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-red-500" /> CPU
        </div>
        <div className="flex items-center gap-2">
          <MemoryStick className="text-blue-500" /> RAM
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="text-yellow-500" /> Storage
        </div>
      </div>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats}>
            <XAxis dataKey="time" hide={false} tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#f87171"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="ram"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="storage"
              stroke="#facc15"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
