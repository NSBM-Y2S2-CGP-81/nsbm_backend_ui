"use client";
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "@/components/navbar";

const MicProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [micData, setMicData] = useState({
    micName: "Jane Doe",
    clubName: "Tech Enthusiasts Club",
    description: "We explore the latest trends in technology and innovation!",
    email: "techclub@unifresh.com",
    phone: "+1 987 654 3210",
    location: "Student Union, Room 102",
    password: "",
    confirmPassword: "",
    otpEmail: "",
    otpPhone: "",
  });

  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMicData({ ...micData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (micData.password !== micData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!otpVerified) {
      alert("Please verify the OTP to change your password.");
      return;
    }

    console.log("Saved Data:", micData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleSendOtp = (method: "email" | "phone") => {
    // Simulate sending OTP
    alert(`OTP sent to your email and phone number.`);
  };

  const handleVerifyOtp = () => {
    // Simulate OTP verification
    if (micData.otpEmail === "123456" && micData.otpPhone === "654321") {
      setOtpVerified(true);
      alert("OTP Verified! You can now change your password.");
    } else {
      alert("Invalid OTPs. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to initial data
    setMicData({
      micName: "Jane Doe",
      clubName: "Tech Enthusiasts Club",
      description: "We explore the latest trends in technology and innovation!",
      email: "techclub@unifresh.com",
      phone: "+1 987 654 3210",
      location: "Student Union, Room 102",
      password: "",
      confirmPassword: "",
      otpEmail: "",
      otpPhone: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      {/* Navbar */}
      <Navbar name="clubs & society: Profile [MIC]" />

      <div className="flex items-center justify-center mt-10">
        <div className="bg-[#1F2937] rounded-3xl shadow-2xl p-10 w-full max-w-3xl">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <FaUserCircle className="text-6xl text-gray-400 mb-2" />
            <h2 className="text-3xl font-bold text-white">{micData.micName}</h2>
            <p className="text-gray-400">{micData.clubName}</p>
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
            {/* MIC Name */}
            <div>
              <label className="text-gray-300">MIC Name</label>
              <input
                type="text"
                name="micName"
                value={micData.micName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Club/Society Name */}
            <div>
              <label className="text-gray-300">Club/Society Name</label>
              <input
                type="text"
                name="clubName"
                value={micData.clubName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <hr className="border-gray-700 my-6" />

            {/* Description */}
            <div>
              <label className="text-gray-300">Description</label>
              <textarea
                name="description"
                value={micData.description}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={micData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-300">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={micData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300">Location</label>
                <input
                  type="text"
                  name="location"
                  value={micData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Password Section */}
            {isEditing && (
              <>
                <hr className="border-gray-700 my-6" />
                {/* OTP */}
                <div>
                  <label className="text-gray-300">OTP</label>
                  <input
                    type="text"
                    name="otpEmail"
                    value={micData.otpEmail}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendOtp("email")}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full"
                  >
                    Send OTP
                  </button>
                </div>

                <div>
                  <label className="text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={micData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full mt-1 p-3 rounded-xl bg-[#374151] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <p className="text-xs text-gray-400 mt-2">Leave blank to keep current password.</p>
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
                  className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium"
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
