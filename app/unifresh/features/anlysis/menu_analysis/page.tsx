"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { format } from "date-fns";

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

  // Updated order data with values in LKR
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

  // Correct total revenue calculation in LKR
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
  const totalItemsSold = itemSales.reduce((sum, item) => sum + item.sold, 0);
  const mostPopularItem = itemSales.sort((a, b) => b.sold - a.sold)[0];

  return (
    <div className="space-y-8 bg-[#0A0D14] text-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-white mb-8">Menu Analytics</h2>

      {/* Time Period Selection */}
      <div className="flex justify-center items-center mb-6">
        <label className="font-semibold text-gray-300 mr-4">Select Time Period:</label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-3 w-48 border-2 border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#1A202C] text-white text-lg"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Bar Chart - Smaller Size */}
      <div className="mb-6 w-full max-w-4xl mx-auto h-80">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Menu Sales Overview",
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
                    return `${context.label}: ${context.raw} sold`;
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
                  stepSize: 1,
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
          <p className="text-xl font-bold text-green-400">LKR {totalRevenue}</p>
        </div>
        <div className="flex justify-between text-gray-300">
          <p className="font-semibold text-lg text-white">Total Items Sold:</p>
          <p className="text-xl font-bold text-blue-400">{totalItemsSold}</p>
        </div>
        <div className="flex justify-between text-gray-300">
          <p className="font-semibold text-lg text-white">Most Popular Item:</p>
          <p className="text-xl font-bold text-orange-400">{mostPopularItem.name}</p>
        </div>
      </div>
    </div>
  );
}
