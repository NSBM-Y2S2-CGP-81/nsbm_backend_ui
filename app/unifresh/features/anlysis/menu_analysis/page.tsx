"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { format } from "date-fns";
import Navbar from "@/components/navbar";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type MenuAnalyticsProps = {
  menu?: { id: number; name: string; price: number }[];
  orders?: { id: number; items: string[]; total: number; date: string }[];
};

export default function MenuAnalytics({ menu = [], orders = [] }: MenuAnalyticsProps) {
  const dummyMenu = [
    { id: 1, name: "Cheese Burger", price: 599 },
    { id: 2, name: "Veggie Wrap", price: 405 },
    { id: 3, name: "Chicken Sandwich", price: 649 },
    { id: 4, name: "Fries", price: 669 },
  ];

  const dummyOrders = [
    { id: 101, items: ["Cheese Burger", "Fries"], total: 1899, date: "2025-01-15" },
    { id: 102, items: ["Veggie Wrap", "Fries"], total: 2049, date: "2025-02-20" },
    { id: 103, items: ["Cheese Burger", "Chicken Sandwich"], total: 2548, date: "2025-03-10" },
    { id: 104, items: ["Fries"], total: 669, date: "2025-04-05" },
    { id: 105, items: ["Chicken Sandwich", "Cheese Burger"], total: 2278, date: "2025-04-10" },
  ];

  const menuData = menu.length > 0 ? menu : dummyMenu;
  const ordersData = orders.length > 0 ? orders : dummyOrders;

  const [timePeriod, setTimePeriod] = useState("month");

  const filterOrdersByTimePeriod = (timePeriod: string) => {
    const filteredOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.date);
      const now = new Date();

      if (timePeriod === "week") {
        const diffInTime = now.getTime() - orderDate.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
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

  const itemSales = menuData.map((item) => ({
    name: item.name,
    sold: filteredOrders.reduce((count, order) => count + (order.items.includes(item.name) ? 1 : 0), 0),
  }));

  const data = {
    labels: itemSales.map((item) => item.name),
    datasets: [
      {
        label: "Items Sold",
        data: itemSales.map((item) => item.sold),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        barThickness: 20,
      },
    ],
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const formattedRevenue = `Rs. ${totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  const totalItemsSold = itemSales.reduce((sum, item) => sum + item.sold, 0);
  const mostPopularItem = itemSales.sort((a, b) => b.sold - a.sold)[0];

  return (
    <div className="space-y-12 bg-[#0A0D14] text-white shadow-lg rounded-xl p-10">
      <Navbar name="Uni Fresh: Menu Analytics" />

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
        </select>
      </div>

      <div className="flex flex-wrap justify-center space-x-6 mb-12">
        {/* Most Sold Item */}
        <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center max-w-xs mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Most Sold Item</h3>
          <p className="text-2xl font-bold text-yellow-500 text-center">{mostPopularItem.name}</p>
          <p className="text-sm text-gray-300 mt-4 text-center">
            This is the most sold item with a total of <strong>{mostPopularItem.sold}</strong> sold.
          </p>
        </div>

        {/* Total Items Sold */}
        <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center max-w-xs mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Total Items Sold</h3>
          <p className="text-4xl font-bold text-blue-400">{totalItemsSold}</p>
          <p className="text-sm text-gray-300 mt-4 text-center">
            Total quantity of items sold during the selected period.
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#1A202C] p-8 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex flex-col items-center max-w-xs mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-400 text-center">{formattedRevenue}</p>
          <p className="text-sm text-gray-300 mt-4 text-center">
            Total revenue generated from sales during the selected period.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto h-[500px] mt-12">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Menu Sales Overview (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})`,
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
                    return `${context.label}: ${context.raw} sold`;
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
                  stepSize: 1,
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
