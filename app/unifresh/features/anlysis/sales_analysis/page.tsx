"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { format } from "date-fns";

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
    { id: 105, items: ["Chicken Sandwich", "Cheese Burger"], total:1128, date: "2025-04-10" },
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
      }
      return true;
    });

    return filteredOrders;
  };

  const filteredOrders = filterOrdersByTimePeriod(timePeriod);

  const salesData = filteredOrders.reduce((acc, order) => {
    const orderDate = new Date(order.date);
    let label = '';

    if (timePeriod === "week") {
      label = `Week ${Math.floor(orderDate.getDate() / 7) + 1}`;
    } else if (timePeriod === "month") {
      label = format(orderDate, "MMM yyyy");
    } else if (timePeriod === "year") {
      label = format(orderDate, "yyyy");
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
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        barThickness: 20,
      },
    ],
  };

  return (
    <div className="space-y-8 bg-[#0A0D14] text-white shadow-lg rounded-lg p-8">
      <h2 className="text-4xl font-bold text-center mb-8 text-white">Sales Analysis</h2>

      {/* Time Period Selection */}
      <div className="flex justify-center items-center mb-6">
        <label className="font-semibold text-gray-200 text-lg mr-4">Select Time Period:</label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-3 w-48 border-2 border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-[#1A202C] text-white text-lg"
        >
          <option value="week">Last Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Sales Chart - Smaller Height */}
      <div className="mb-6 w-full max-w-4xl mx-auto h-80">
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
                  size: 22,
                  weight: 'bold',
                },
                color: '#fff',
                padding: {
                  bottom: 20,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.label}: LKR ${context.raw.toFixed(2)} revenue`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                },
                ticks: {
                  color: '#fff',
                },
              },
              y: {
                grid: {
                  borderDash: [5, 5],
                  color: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                },
                ticks: {
                  beginAtZero: true,
                  stepSize: 10,
                  color: '#fff',
                },
              },
            },
          }}
        />
      </div>

      {/* Summary Section */}
      <div className="space-y-4 bg-[#1A202C] p-6 rounded-lg shadow-md">
        <div className="flex justify-between text-gray-300">
          <p className="font-semibold text-lg text-white">Total Revenue:</p>
          <p className="text-xl font-bold text-green-400">LKR {filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
        </div>

        <div className="flex justify-between text-gray-300">
          <p className="font-semibold text-lg text-white">Total Orders:</p>
          <p className="text-xl font-bold text-blue-400">{filteredOrders.length}</p>
        </div>
      </div>
    </div>
  );
}
