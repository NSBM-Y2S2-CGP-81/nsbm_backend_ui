"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import CountUp from "react-countup";
import Navbar from "@/components/navbar";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ParticipationAnalysisProps = {
  events?: { id: number; name: string; participants: number; date: string }[];
};

export default function ParticipationAnalysis({ events = [] }: ParticipationAnalysisProps) {
  const dummyEvents = [
    { id: 1, name: "Freshers' Orientation", participants: 120, date: "2025-01-10" },
    { id: 2, name: "Coding Hackathon", participants: 80, date: "2025-02-15" },
    { id: 3, name: "Buddhist Discussion", participants: 45, date: "2025-03-05" },
    { id: 4, name: "Sports Day", participants: 150, date: "2025-04-02" },
    { id: 5, name: "Cultural Night", participants: 90, date: "2025-04-12" },
  ];

  const eventsData = events.length > 0 ? events : dummyEvents;
  const [timePeriod, setTimePeriod] = useState("all");

  const filterEventsByTimePeriod = (timePeriod: string) => {
    const now = new Date();
    return eventsData.filter((event) => {
      const eventDate = new Date(event.date);
      if (timePeriod === "week") {
        const diffInDays = (now.getTime() - eventDate.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 7;
      } else if (timePeriod === "month") {
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      } else if (timePeriod === "year") {
        return eventDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredEvents = filterEventsByTimePeriod(timePeriod);

  const bestEvent = filteredEvents.reduce((max, event) => (event.participants > max.participants ? event : max), filteredEvents[0]);

  const data = {
    labels: filteredEvents.map((event) => event.name),
    datasets: [
      {
        label: "Participants",
        data: filteredEvents.map((event) => event.participants),
        backgroundColor: filteredEvents.map(
          (event) => `rgba(255, ${100 + event.participants / 2}, 132, 0.7)`
        ),
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-white">
      {/* Navbar */}
      <Navbar name="Clubs & Society: Event Analysis [MIC]" />

      {/* Content */}
      <div className="flex-grow p-8 pt-24"> {/* <-- ADD padding top here */}
        
        {/* Time Period Selector */}
        <div className="flex justify-center items-center my-8">
          <label className="font-semibold text-gray-300 text-lg mr-4">Filter by:</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="p-3 w-52 border-2 border-gray-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all bg-[#1F2937] text-white text-lg"
          >
            <option value="all">All Events</option>
            <option value="week">Last Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Top Event */}
          <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-yellow-400/40 transition-all flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Top Event</h3>
            <p className="text-2xl font-bold text-yellow-400 text-center">{bestEvent?.name || "N/A"}</p>
          </div>

          {/* Highest Participants */}
          <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-green-400/40 transition-all flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Highest Participants</h3>
            <p className="text-4xl font-bold text-green-400">
              <CountUp end={bestEvent?.participants || 0} duration={2} />
            </p>
          </div>

          {/* Total Events */}
          <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-blue-400/40 transition-all flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">Total Events</h3>
            <p className="text-4xl font-bold text-blue-400">
              <CountUp end={filteredEvents.length} duration={2} />
            </p>
          </div>
        </div>

        {/* Participation Chart */}
        <div className="w-full max-w-6xl mx-auto h-[500px]">
          <Bar
            data={data}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Participants Per Event",
                  font: {
                    size: 24,
                    weight: "bold",
                  },
                  color: "#fff",
                  padding: {
                    bottom: 30,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw} participants`,
                  },
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "#fff",
                    font: {
                      size: 13,
                    },
                  },
                },
                y: {
                  grid: {
                    borderDash: [8, 4],
                    color: "rgba(255, 255, 255, 0.15)",
                  },
                  ticks: {
                    beginAtZero: true,
                    stepSize: 20,
                    color: "#fff",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
