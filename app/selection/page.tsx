"use client";
import React from "react";
import Image from "next/image";
import GlassmorphicCard from "@/components/clickableCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center p-6">
      <Image
        src="/assets/images/logo.png"
        width={150}
        height={150}
        alt="NSBM Logo"
        aria-label="NSBM Logo"
        className="filter brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,1)] mb-4"
      />

      <h1 className="text-white text-2xl font-semibold mb-8 text-center">
        NSBM Green University
      </h1>

      <div className="flex flex-row flex-nowrap gap-x-6 overflow-x-auto w-full justify-center max-w-6xl px-4">
        <GlassmorphicCard
          title="Administration"
          text="Admin Platform"
          buttonText="->"
          onClick={() => (window.location.href = "/auth")}
        />
        <GlassmorphicCard
          title="Club's MIC"
          text="MIC Platform for Event Management"
          buttonText="->"
          onClick={() => (window.location.href = "/foc")}
        />
        <GlassmorphicCard
          title="Catering Partners"
          text="UniFresh Platform for NSBM food service vendors"
          buttonText="->"
          onClick={() => (window.location.href = "/foe")}
        />
      </div>
    </div>
  );
}
