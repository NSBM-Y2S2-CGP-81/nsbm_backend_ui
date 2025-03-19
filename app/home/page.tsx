"use client";
import Navbar from "@/components/navbar";
import SystemMonitor from "@/components/monitor";
import GlassmorphicCard from "@/components/clickableCard";
import fetcher from "@/components/services/fetcher";

export default function Home() {
  try {
    const API_KEY =
      typeof window !== "undefined"
        ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
        : null;

    const TABLE_NAME = "admin_sys_stats";
    const response = await fetcher("crowd_uplink", API_KEY);

    // Process the response if it's valid
    console.log("System stats fetched successfully:", response);
  } catch (error) {
    console.log("Error fetching system stats:", error);
    // window.location.href = "/auth";
  }

  return (
    <div>
      <Navbar />
      <div className="pt-25 flex flex-col items-center justify-center p-10">
        <SystemMonitor />
      </div>
      <div className="flex items-center justify-center w-screen gap-10">
        <GlassmorphicCard
          title="User Status"
          text="Currently Active Users: ( ! )"
          buttonText="->"
          onClick={() => console.log("Button Clicked!")}
        />
        <GlassmorphicCard
          title="Event Details"
          text="Event Requests : ( ! )"
          buttonText="->"
          onClick={() => (window.location.href = "/events")}
        />
        <GlassmorphicCard
          title="News Feed"
          text="Currently Posted News: ( ! )"
          buttonText="->"
          onClick={() => (window.location.href = "/news")}
        />
        <GlassmorphicCard
          title="AP Remote Uplink"
          text="Current Status: ( ! )"
          buttonText="->"
          onClick={() => console.log("Button Clicked!")}
        />
      </div>
    </div>
  );
}
