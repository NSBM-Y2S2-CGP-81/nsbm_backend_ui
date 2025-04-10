"use client";
import React from "react";
import Navbar from "@/components/navbar";
import GlassmorphicCard from "@/components/clickableCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
      <Navbar name="NSBM SA: Events Management Interface [ADMIN]" />
      
      <div className="min-h-screen flex items-center justify-center">
  <div className="flex flex-col items-center justify-center p-10">
    {/* TABS */}
    <div className="flex gap-4">
      <GlassmorphicCard
        title="Events"
        text="Upcoming Events"
        buttonText="->"
        onClick={() => (window.location.href = "/events")}
      />
      <GlassmorphicCard
        title="Requests"
        text="Pending Request"
        buttonText="->"
        onClick={() => (window.location.href = "/Request")}
      />
      </div>
     </div>
    </div>
    </div>
  );
}
