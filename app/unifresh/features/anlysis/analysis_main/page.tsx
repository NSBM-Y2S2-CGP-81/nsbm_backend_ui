"use client";
import React from "react";
import Navbar from "@/components/navbar";
import GlassmorphicCard from "@/components/clickableCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
        <Navbar name="Uni Fresh: Analysis [Vendor]" />

      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-10">
          {/* TABS */}
          <div className="flex gap-4">
            <GlassmorphicCard
              title="Sales Analysis"
              text="View Sales analysis"
              buttonText="->"
              onClick={() => (window.location.href = "/unifresh/features/anlysis/sales_analysis")}
            />
            <GlassmorphicCard
              title="Menu Analysis"
              text="view Menu analysis"
              buttonText="->"
              onClick={() => (window.location.href = "/unifresh/features/anlysis/menu_analysis")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
