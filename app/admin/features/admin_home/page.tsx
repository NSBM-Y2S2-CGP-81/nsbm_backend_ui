"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import SystemMonitor from "@/components/monitor";
import GlassmorphicCard from "@/components/clickableCard";
import fetcher from "@/components/services/fetcher";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function EventManagementPage() {
  const [systemStats, setSystemStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-[#0A0D14] to-[#131824]"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="pb-10"
      >
        <Navbar />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          bounce: 0.3,
        }}
        className="pt-25 flex flex-col items-center justify-center p-10"
      >
        <SystemMonitor />
      </motion.div>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="flex items-center justify-center w-screen gap-10 flex-wrap py-10"
      >
        <motion.div variants={item}>
          <GlassmorphicCard
            title="User Status"
            text="Check & Edit User Details"
            buttonText="->"
            onClick={() => (window.location.href = "/admin/features/users")}
          />
        </motion.div>
        <motion.div variants={item}>
          <GlassmorphicCard
            title="Event Details"
            text="Check & Edit Event Details"
            buttonText="->"
            onClick={() => (window.location.href = "/admin/features/event_management/a_events_main")}
          />
        </motion.div>
        <motion.div variants={item}>
          <GlassmorphicCard
            title="News Feed"
            text="Check & Edit News Feed"
            buttonText="->"
            onClick={() => (window.location.href = "/admin/features/news")}
          />
           </motion.div>
        <motion.div variants={item}>
          <GlassmorphicCard
            title="Lecture Schedule"
            text="Check & Edit lecture Details"
            buttonText="->"
            onClick={() => (window.location.href = "/admin/features/lecture_scheduling/a_lecture_main")}
            />
            </motion.div>
        <motion.div variants={item}>
          <GlassmorphicCard
            title="MongoDB Interface"
            text="Communicate with MongoDB"
            buttonText="->"
            onClick={() => (window.location.href = "/admin/features/mongodb")}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
