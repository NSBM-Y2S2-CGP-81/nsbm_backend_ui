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
    <div>
      <Navbar name="Admin Panel: Manage Users" />
      <div className="p-8">
        <h1 className="text-4xl font-bold text-center mb-8">All Users</h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white/20 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20"
              >
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <button
                  className="mt-4 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit User</h2>
            <input
              type="text"
              name="name"
              value={selectedUser.name}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={selectedUser.email}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Email"
            />
            <input
              type="text"
              name="role"
              value={selectedUser.role}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Role"
            />
            <div className="flex gap-4 mt-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 w-full"
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
