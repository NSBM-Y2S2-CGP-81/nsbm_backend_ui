"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { format } from "date-fns";
import Navbar from "@/components/navbar";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SalesAnalysisProps = {
  orders?: { id: number; items: string[]; total: number; date: string }[];
};

export default function SalesAnalysis({ orders = [] }: SalesAnalysisProps) {
  const dummyOrders = [
    { id: 101, items: ["Cheese Burger", "Fries"], total: 899, date: "2025-01-15" },
    { id: 102, items: ["Veggie Wrap", "Fries"], total: 749, date: "2025-02-20" },
    { id: 103, items: ["Cheese Burger", "Chicken Sandwich"], total: 1248, date: "2025-03-10" },
    { id: 104, items: ["Fries"], total: 2.99, date: "2025-04-05" },
    { id: 105, items: ["Chicken Sandwich", "Cheese Burger"], total: 1128, date: "2025-04-10" },
  ];

  const ordersData = orders.length > 0 ? orders : dummyOrders;
  const [timePeriod, setTimePeriod] = useState("month");

  const filterOrdersByTimePeriod = (timePeriod: string) => {
    const filteredOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.date);
      const now = new Date();

      if (timePeriod === "week") {
        const diffInDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 7;
      } else if (timePeriod === "month") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (timePeriod === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      } else if (timePeriod === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      return true;
    });

    return filteredOrders;
  };

  const filteredOrders = filterOrdersByTimePeriod(timePeriod);

  const salesData = filteredOrders.reduce((acc, order) => {
    const orderDate = new Date(order.date);
    let label = "";

    if (timePeriod === "week") {
      label = `Week ${Math.floor(orderDate.getDate() / 7) + 1}`;
    } else if (timePeriod === "month") {
      label = format(orderDate, "MMM yyyy");
    } else if (timePeriod === "year") {
      label = format(orderDate, "yyyy");
    } else if (timePeriod === "today") {
      label = "Today";
    }

    if (!acc[label]) {
      acc[label] = 0;
    }

    acc[label] += order.total;

    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(salesData),
    datasets: [
      {
        label: "Sales Revenue",
        data: Object.values(salesData),
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Updated for smoother look
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        barThickness: 30, // Thicker bars for better visibility
      },
    ],
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;

  return (
    <div className="space-y-12 bg-[#0A0D14] text-white shadow-lg rounded-xl p-10">
      <Navbar name="Uni Fresh: Profile [Vendor]" />

      {/* Added margin-top to ensure the filter is clearly visible */}
      <div className="mt-16 flex justify-center items-center mb-8">
        <label className="font-semibold text-gray-300 text-lg mr-4">Filter by:</label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-3 w-52 border-2 border-gray-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-[#1F2937] text-white text-lg"
        >
          <option value="week">Last Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="today">Today</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center space-x-6 mb-12">
        {/* Total Revenue */}
        <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center max-w-xs">
          <h3 className="text-xl font-semibold mb-4 text-center">Total Revenue</h3>
          <p className="text-2xl font-bold text-yellow-500 text-center">
            LKR {totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-300 mt-4 text-center">
            This is the total revenue earned from all orders in the selected period.
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center max-w-xs">
          <h3 className="text-xl font-semibold mb-4 text-center">Total Orders</h3>
          <p className="text-4xl font-bold text-green-400">{totalOrders}</p>
          <p className="text-sm text-gray-300 mt-4 text-center">
            This shows the total number of orders placed during the selected period.
          </p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="w-full max-w-6xl mx-auto h-[500px] mt-12">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Sales Overview (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})`,
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
                  label: function (context) {
                    return `${context.label}: LKR ${context.raw.toFixed(2)} revenue`;
                  },
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
                  stepSize: 100,
                  color: "#fff",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
