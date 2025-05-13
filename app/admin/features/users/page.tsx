"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import fetchData from "@/components/services/auth-refresh";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
        console.log(API_KEY);
        const res = await fetchData("users", API_KEY);
        console.log("Fetched users:", res); // Log the response to check its structure
        setUsers(Array.isArray(res) ? res : []); // Ensure users is always an array
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.put(
        `${SERVER_ADDRESS}/data/users/update/${selectedUser._id}`,
        selectedUser,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? selectedUser : user,
        ),
      );
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
      <Navbar name="Admin Panel: Manage Users" />
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8">All Users</h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-md border border-white/20 hover:scale-105 transition-transform duration-300 ease-out"
              >
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-white/80">Email: {user.email}</p>
                <p className="text-white/80">Role: {user.role}</p>
                <button
                  className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
                  onClick={() => setSelectedUser(user)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit User</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={selectedUser.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-800"
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={selectedUser.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-800"
                placeholder="Email"
              />
              <input
                type="text"
                name="role"
                value={selectedUser.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-800"
                placeholder="Role"
              />
            </div>
            <div className="flex gap-6 mt-6">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 w-full"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors duration-300 w-full"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
