"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import SystemMonitor from "@/components/monitor";
import GlassmorphicCard from "@/components/clickableCard";
import fetcher from "@/components/services/fetcher";

export default function EventManagementPage() {
  const [systemStats, setSystemStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_KEY =
          typeof window !== "undefined"
            ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
            : null;

        if (!API_KEY) {
          console.warn("API key not found in localStorage.");
          return;
        }

        const response = await fetcher("crowd_uplink", API_KEY);
        console.log("System stats fetched successfully:", response);
        setSystemStats(response);
      } catch (error) {
        console.error("Error fetching system stats:", error);
        // Optionally redirect
        // window.location.href = "/auth";
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="pb-20">
        <Navbar />
      </div>

      <div className="pt-25 flex flex-col items-center justify-center p-10">
        <SystemMonitor />
      </div>

      <div className="flex items-center justify-center w-screen gap-10 flex-wrap">
        <GlassmorphicCard
          title="User Status"
          text="Check & Edit User Details"
          buttonText="->"
          onClick={() => (window.location.href = "/users")}
        />
        <GlassmorphicCard
          title="Event Details"
          text="Check & Edit Event Details"
          buttonText="->"
          onClick={() => (window.location.href = "/events_main")}
        />
        <GlassmorphicCard
          title="News Feed"
          text="Check & Edit News Feed"
          buttonText="->"
          onClick={() => (window.location.href = "/news")}
        />
        <GlassmorphicCard
          title="MongoDB Interface"
          text="Communicate with MongoDB"
          buttonText="->"
          onClick={() => (window.location.href = "/mongodb")}
        />
      </div>
    </div>
  );
}
