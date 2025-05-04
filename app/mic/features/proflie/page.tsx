"use client";
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "@/components/navbar";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { toast, Toaster } from "react-hot-toast";

const MicProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [micData, setMicData] = useState({
    _id: "",
    email: "",
    society_name: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMicData();
  }, []);

  const fetchMicData = async () => {
    setIsLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      const MIC_ID = localStorage.getItem("USER_ID");
      if (!API_KEY) {
        toast.error("Authentication failed. Please login again.");
        setTimeout(
          () => (window.location.href = "/mic/a_mic_signin/mic_auth"),
          2000,
        );
        return;
      }

      // Fetch user data directly using token
      const response = await axios.get(
        `${SERVER_ADDRESS}/data/mic_users/fetch/${MIC_ID}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );

      console.log(response);
      const userData = response.data;
      setMicData({
        _id: userData._id || "",
        email: userData.email || "",
        society_name: userData.society_name || "",
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching MIC data:", error);
      toast.error("Failed to load your profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setMicData({ ...micData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    // If changing password, validate password rules and matching
    if (micData.newPassword) {
      if (micData.newPassword !== micData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      if (micData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setSubmitting(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

      // Prepare update data - only include password if it was changed
      const updateData: { password?: string } = {};

      // Only include password if it was changed
      if (micData.newPassword) {
        // First hash the password using the hashPassword endpoint
        const hashResponse = await axios.post(
          `${SERVER_ADDRESS}/custom/hash-password`,
          { plaintext: micData.newPassword },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Use the hashed password instead of plaintext
        if (hashResponse.data && hashResponse.data.hash) {
          updateData.password = hashResponse.data.hash;
        } else {
          throw new Error("Failed to hash password");
        }
      }

      await axios.put(
        `${SERVER_ADDRESS}/data/mic_users/update/${micData._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // Reset password fields
      setMicData({
        ...micData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchMicData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <Toaster position="top-right" />
      {/* Navbar */}
      <Navbar name="Clubs & Society: Profile [MIC]" />

      <div className="flex items-center justify-center mt-30">
        <div className="bg-[#1F2937] rounded-3xl shadow-2xl p-10 w-full max-w-3xl">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <FaUserCircle className="text-6xl text-gray-400 mb-2" />
            <h2 className="text-3xl font-bold text-white">
              {micData.society_name}
            </h2>
            <p className="text-gray-400">{micData.email}</p>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleEditToggle}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Form Section */}
          <div className="space-y-6">
            {/* Email field - read-only */}
            <div>
              <label className="text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={micData.email}
                disabled={true}
                className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Club/Society Name */}
            <div>
              <label className="text-gray-300">Society Name</label>
              <input
                type="text"
                name="society_name"
                value={micData.society_name}
                disabled={true} // Society name can't be changed
                className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Password Section */}
            {isEditing && (
              <>
                <hr className="border-gray-700 my-6" />

                <div>
                  <label className="text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={micData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Password must be at least 8 characters.
                  </p>
                </div>

                <div>
                  <label className="text-gray-300">Retype Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={micData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Retype your password"
                    className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </>
            )}

            {/* Save and Cancel Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-blue-800 disabled:opacity-70"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium disabled:bg-red-800 disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicProfile;
