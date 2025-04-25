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
          <div className="flex gap-4 flex-wrap justify-center">
            <GlassmorphicCard
              title="Adminstration"
              text="Faculty of Business"
              buttonText="->"
              onClick={() => (window.location.href = "/fob")}
            />
            <GlassmorphicCard
              title="Club's Master IN Charge"
              text="Faculty of Computing"
              buttonText="->"
              onClick={() => (window.location.href = "/foc")}
            />
            <GlassmorphicCard
              title=""
              text="Faculty Of"
              buttonText="->"
              onClick={() => (window.location.href = "/foe")}
            />
            <GlassmorphicCard
              title="FOS"
              text="Faculty Of Science"
              buttonText="->"
              onClick={() => (window.location.href = "/fos")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
