"use client";

import React, { useState, useEffect } from "react";
import SERVER_ADDRESS from "@/config";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CountUp from "react-countup";
import Navbar from "@/components/navbar";

// Register chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type Event = {
  id: string;
  name: string;
  participants: number;
  date: string;
};

type ParticipationAnalysisProps = {
  events?: Event[];
};

export default function ParticipationAnalysis({
  events = [],
}: ParticipationAnalysisProps) {
  const [eventsData, setEventsData] = useState<Event[]>(events);
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (events.length > 0) {
        setEventsData(events);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNetworkActivity(true);

      try {
        const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

        if (!API_KEY) {
          throw new Error("API key not found");
        }

        // Fetch events data
        const response = await fetch(`${SERVER_ADDRESS}/data/events/fetch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        if (!data || data.length === 0) {
          throw new Error("No events found");
        }

        // Define fetchEventCountByName function first
        const fetchEventCountByName = async (
          event: string,
        ): Promise<number> => {
          try {
            const countResponse = await fetch(
              `${SERVER_ADDRESS}/data/event_registrations/count?field=event_id&value=${event._id}&event_data_get=${event._id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${API_KEY}`,
                },
              },
            );

            if (countResponse.ok) {
              const data = await countResponse.json();
              console.log(data);
              return data.count || 0;
            }
            return 0;
          } catch (error) {
            console.error("Error fetching event count:", error);
            return 0;
          }
        };

        // Process each event and set participants count
        const processedEvents = [];
        for (const event of data) {
          const participants = await fetchEventCountByName(event);
          processedEvents.push({
            id: event._id || event.id,
            name: event.event_name || event.event_title,
            participants: participants,
            date: event.date || event.eventDate || new Date().toISOString(),
          });
        }

        console.log("Processed events:", processedEvents);
        setEventsData(processedEvents);
        setTotalEvents(processedEvents.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
        console.error("Error in fetchEvents:", err);
        setEventsData([]);
      } finally {
        setIsLoading(false);
        setNetworkActivity(false);
      }
    };

    fetchEvents();
  }, [events]);

  const filterEventsByTimePeriod = (timePeriod: string) => {
    const now = new Date();
    return eventsData.filter((event) => {
      if (!event.date) return true; // Include events without dates

      const eventDate = new Date(event.date);
      if (timePeriod === "week") {
        const diffInDays =
          (now.getTime() - eventDate.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 7;
      } else if (timePeriod === "month") {
        return (
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        );
      } else if (timePeriod === "year") {
        return eventDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredEvents = filterEventsByTimePeriod(timePeriod);

  const bestEvent =
    filteredEvents.length > 0
      ? filteredEvents.reduce(
          (max, event) => (event.participants > max.participants ? event : max),
          filteredEvents[0],
        )
      : null;

  const data = {
    labels: filteredEvents.map((event) => event.name),
    datasets: [
      {
        label: "Participants",
        data: filteredEvents.map((event) => event.participants),
        backgroundColor: filteredEvents.map(
          (event) => `rgba(255, ${100 + event.participants / 2}, 132, 0.7)`,
        ),
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-white relative">
      {/* Navbar */}
      <Navbar name="Clubs & Society: Event Analysis [MIC]" />

      {/* Network Activity Throbber */}
      {networkActivity && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center justify-center bg-blue-900/80 rounded-full w-16 h-16 shadow-lg shadow-blue-500/30">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow p-8 pt-24">
        {" "}
        {/* <-- ADD padding top here */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <p className="text-xl text-blue-400">Loading events data...</p>
          </div>
        )}
        {error && (
          <div className="flex justify-center my-8">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        )}
        {/* Time Period Selector */}
        <div className="flex justify-center items-center my-8">
          <label className="font-semibold text-gray-300 text-lg mr-4">
            Filter by:
          </label>
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
            <h3 className="text-xl font-semibold mb-4 text-center">
              Top Event
            </h3>
            <p className="text-2xl font-bold text-yellow-400 text-center">
              {bestEvent?.name || "N/A"}
            </p>
          </div>

          {/* Highest Participants */}
          <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-green-400/40 transition-all flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Highest Participants
            </h3>
            <p className="text-4xl font-bold text-green-400">
              <CountUp end={bestEvent?.participants || 0} duration={2} />
            </p>
          </div>

          {/* Total Events */}
          <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-blue-400/40 transition-all flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Total Events
            </h3>
            <p className="text-4xl font-bold text-blue-400">
              <CountUp end={filteredEvents.length} duration={2} />
            </p>
          </div>
        </div>
        {/* Participation Chart */}
        <div className="w-full max-w-6xl mx-auto h-[500px]">
          {filteredEvents.length > 0 ? (
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
                      label: (context) =>
                        `${context.label}: ${context.raw} participants`,
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
                      color: "rgba(255, 255, 255, 0.15)",
                      lineWidth: 1,
                    },
                    ticks: {
                      color: "#fff",
                      stepSize: 20,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl text-gray-400">
                No events data available for the selected period
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
