"use client";
import { useState, useEffect } from "react";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/navbar";
import { Toaster, toast } from "react-hot-toast";

// Define the EventRequest interface
interface EventRequest {
  _id: string;
  eventName: string;
  selectedDate: string;
  selectedTime?: string;
  location: string;
  maxTickets?: number;
  eventType: string;
  societyName: string;
  registrationLink?: string;
  description?: string;
  status?: string;
  creatorEmail?: string;
  image?: {
    type: string;
    data: string;
  };
  file?: {
    type: string;
    data: string;
    name: string;
  };
}

export default function EventRequestsPage() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [timeInput, setTimeInput] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [savingTime, setSavingTime] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionId, setRejectionId] = useState<string | null>(null);

  // Filter states
  const [searchDate, setSearchDate] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEventType, setSearchEventType] = useState("");
  const [searchSociety, setSearchSociety] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
        const data = await fetcher("event_requests", API_KEY);

        // Process the data to handle any requests that might already be declined
        const processedData = data.map((request: EventRequest) => {
          // Check if the request has a status field already
          if (request.status) {
            return request;
          }
          // Otherwise, default to an empty status
          return {
            ...request,
            status: "",
          };
        });

        setRequests(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event requests:", error);
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setProcessingIds((prev) => [...prev, id]);
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

      // Fetch the request data by ID
      const response = await axios.get(
        `${SERVER_ADDRESS}/data/event_requests/fetch/${id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );

      const requestData = response.data;

      // Prepare the data for storing in the events collection
      const eventData = {
        event_name: requestData.eventName,
        event_date: requestData.selectedDate,
        event_time: requestData.selectedTime || "",
        event_image: requestData.image
          ? `data:${requestData.image.type};base64,${requestData.image.data}`
          : "",
        event_description: requestData.description || "",
        event_venue: requestData.location || "",
        event_tickets: requestData.maxTickets || 0,
        event_type: requestData.eventType || "",
        event_held_by: requestData.societyName || "",
        event_status: "Upcoming",
        event_link: requestData.registrationLink || "",
      };

      // Store the data in the events collection
      await axios.post(`${SERVER_ADDRESS}/data/events/store`, eventData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Remove the request from the pending list
      await axios.post(
        `${SERVER_ADDRESS}/data/event_requests/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Send approval email notification to the event creator
      if (requestData.creatorEmail) {
        const emailData = {
          to: requestData.creatorEmail,
          subject: `Event Approved: ${requestData.eventName}`,
          message: `Dear Event Organizer,\n\nYour event "${requestData.eventName}" has been approved by NSBM Administration.\n\nEvent Details:\nDate: ${new Date(requestData.selectedDate).toLocaleDateString()}\nLocation: ${requestData.location}\n\nThank you for organizing events with us.\n\nBest regards,\nNSBM Administration`,
          html_content: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #006633;">Event Approved</h2>
              <p>Dear Event Organizer,</p>
              <p>Your event <strong>${requestData.eventName}</strong> has been approved by NSBM Administration.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Event Details:</h3>
                <p><strong>Date:</strong> ${new Date(requestData.selectedDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${requestData.location}</p>
              </div>
              <p>Thank you for organizing events with us.</p>
              <p>Best regards,<br>NSBM Administration</p>
            </div>
          `,
        };

        await axios.post(`${SERVER_ADDRESS}/email/send`, emailData, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        toast.success("Request approved and email sent!");
      } else {
        toast.success("Request approved!");
      }

      // Update the local state to remove the approved request
      setRequests(requests.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error approving and storing event:", error);
      toast.error("Error approving request");
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const openRejectModal = (id: string) => {
    setRejectionId(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleDelete = async (id: string, reason: string) => {
    try {
      setProcessingIds((prev) => [...prev, id]);
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

      // Fetch the request data by ID
      const response = await axios.get(
        `${SERVER_ADDRESS}/data/event_requests/fetch/${id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );

      const requestData = response.data;

      // Prepare the data for storing in the events collection with declined status
      const eventData = {
        event_name: requestData.eventName,
        event_date: requestData.selectedDate,
        event_time: requestData.selectedTime || "",
        event_image: requestData.image
          ? `data:${requestData.image.type};base64,${requestData.image.data}`
          : "",
        event_description: requestData.description || "",
        event_venue: requestData.location || "",
        event_tickets: requestData.maxTickets || 0,
        event_type: requestData.eventType || "",
        event_held_by: requestData.societyName || "",
        event_status: "Declined", // Set status to Declined
        event_link: requestData.registrationLink || "",
      };

      // Store the data in the events collection
      await axios.post(`${SERVER_ADDRESS}/data/events/store`, eventData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Send rejection email to the creator
      if (requestData.creatorEmail) {
        const emailData = {
          to: requestData.creatorEmail,
          subject: `Event Rejected: ${requestData.eventName}`,
          message: `Dear Event Organizer,\n\nWe regret to inform you that your event "${requestData.eventName}" has been rejected by NSBM Administration.\n\nReason for rejection: ${reason}\n\nEvent Details:\nDate: ${new Date(requestData.selectedDate).toLocaleDateString()}\nLocation: ${requestData.location}\n\nIf you have any questions, please contact the administration.\n\nBest regards,\nNSBM Administration`,
          html_content: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #cc0000;">Event Rejected</h2>
              <p>Dear Event Organizer,</p>
              <p>We regret to inform you that your event <strong>${requestData.eventName}</strong> has been rejected by NSBM Administration.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #cc0000;">Reason for rejection:</h3>
                <p>${reason}</p>
                <h3 style="margin-top: 15px;">Event Details:</h3>
                <p><strong>Date:</strong> ${new Date(requestData.selectedDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${requestData.location}</p>
              </div>
              <p>If you have any questions, please contact the administration.</p>
              <p>Best regards,<br>NSBM Administration</p>
            </div>
          `,
        };

        await axios.post(`${SERVER_ADDRESS}/email/send`, emailData, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        toast.success("Request rejected and email sent to organizer");
      } else {
        toast.success("Request rejected successfully");
      }

      // Mark the request as declined in the local state before removing it
      setRequests(
        requests.map((request) =>
          request._id === id ? { ...request, status: "Declined" } : request,
        ),
      );

      // Wait 2 seconds to show the declined status before removing
      setTimeout(async () => {
        // Remove the request from the pending list
        await axios.delete(
          `${SERVER_ADDRESS}/data/event_requests/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          },
        );

        // Update the local state
        setRequests(requests.filter((request) => request._id !== id));
        setProcessingIds((prev) => prev.filter((itemId) => itemId !== id));
      }, 2000);
    } catch (error) {
      console.error("Error declining and storing event:", error);
      toast.error("Error rejecting the event request");
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id));
    } finally {
      setShowRejectModal(false);
    }
  };

  const handleAddTime = async () => {
    if (!timeInput || !selectedRequest) return;

    try {
      setSavingTime(true);
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.post(
        `${SERVER_ADDRESS}/data/event_requests/add-time/${selectedRequest._id}`,
        { time: timeInput },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Update the local state
      const updatedRequests = requests.map((request) =>
        request._id === selectedRequest._id
          ? { ...request, time: timeInput }
          : request,
      );

      setRequests(updatedRequests);
      setTimeInput("");
      setShowTimeModal(false);
      setSelectedRequest(null);
      toast.success("Time added successfully");
    } catch (error) {
      console.error("Error adding time:", error);
      toast.error("Failed to add time to event");
    } finally {
      setSavingTime(false);
    }
  };

  const openTimeModal = (request: EventRequest) => {
    setSelectedRequest(request);
    setShowTimeModal(true);
  };

  // Handle search and filter changes
  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.target.name === "date") {
      setSearchDate(e.target.value);
    } else if (e.target.name === "location") {
      setSearchLocation(e.target.value);
    } else if (e.target.name === "name") {
      setSearchName(e.target.value);
    } else if (e.target.name === "eventType") {
      setSearchEventType(e.target.value);
    } else if (e.target.name === "society") {
      setSearchSociety(e.target.value);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchDate("");
    setSearchLocation("");
    setSearchName("");
    setSearchEventType("");
    setSearchSociety("");
  };

  // Filter requests based on search criteria
  const filteredRequests = requests.filter((request) => {
    const dateMatch =
      searchDate === "" ||
      (request.selectedDate &&
        new Date(request.selectedDate).toISOString().split("T")[0] ===
          searchDate);

    const locationMatch =
      searchLocation === "" ||
      searchLocation === "All" ||
      (request.location &&
        new RegExp(searchLocation, "i").test(request.location));

    const nameMatch =
      searchName === "" ||
      (request.eventName &&
        request.eventName.toLowerCase().includes(searchName.toLowerCase()));

    const eventTypeMatch =
      searchEventType === "" ||
      searchEventType === "All" ||
      request.eventType === searchEventType;

    const societyMatch =
      searchSociety === "" ||
      searchSociety === "All" ||
      request.societyName === searchSociety;

    return (
      dateMatch && locationMatch && nameMatch && eventTypeMatch && societyMatch
    );
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
      <Toaster position="top-right" />
      <Navbar name="Event Requests Management" />

      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Event Requests</h1>

        {/* Filters */}
        <div className="flex justify-between flex-wrap gap-2 bg-white/10 p-4 rounded-xl mb-6 backdrop-blur">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Filter */}
            <div className="flex flex-col min-w-[150px]">
              <label className="text-white mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={searchDate}
                onChange={handleSearchChange}
                className="bg-white/20 text-white p-2 rounded-md backdrop-blur-lg border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Location Filter */}
            <div className="flex flex-col min-w-[150px]">
              <label className="text-white mb-1">Location</label>
              <select
                name="location"
                value={searchLocation}
                onChange={handleSearchChange}
                className="bg-gray-700 text-white p-2 rounded-md appearance-none"
              >
                <option className="bg-gray-700 text-white">All</option>
                <option className="bg-gray-700 text-white">General</option>
                <option className="bg-gray-700 text-white">FOC</option>
                <option className="bg-gray-700 text-white">FOB</option>
                <option className="bg-gray-700 text-white">FOE</option>
                <option className="bg-gray-700 text-white">Auditorium</option>
                <option className="bg-gray-700 text-white">Ground</option>
                <option className="bg-gray-700 text-white">Entrance</option>
                <option className="bg-gray-700 text-white">Edge</option>
                <option className="bg-gray-700 text-white">Finagle</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-col min-w-[150px]">
              <label className="text-white mb-1">Event Type</label>
              <select
                name="eventType"
                value={searchEventType}
                onChange={handleSearchChange}
                className="bg-gray-700 text-white p-2 rounded-md appearance-none"
              >
                <option className="bg-gray-700 text-white">All</option>
                <option className="bg-gray-700 text-white">
                  Event Held by a Club
                </option>
                <option className="bg-gray-700 text-white">
                  Event Held by a Society
                </option>
                <option className="bg-gray-700 text-white">A Stall</option>
              </select>
            </div>

            {/* Society Filter */}
            <div className="flex flex-col min-w-[150px]">
              <label className="text-white mb-1">Society</label>
              <select
                name="society"
                value={searchSociety}
                onChange={handleSearchChange}
                className="bg-gray-700 text-white p-2 rounded-md appearance-none"
              >
                <option className="bg-gray-700 text-white">All</option>
                <option className="bg-gray-700 text-white">FOSS</option>
                <option className="bg-gray-700 text-white">IEEE</option>
                <option className="bg-gray-700 text-white">NSBM</option>
                <option className="bg-gray-700 text-white">Rotaract</option>
                <option className="bg-gray-700 text-white">Leo Club</option>
                <option className="bg-gray-700 text-white">AIESEC</option>
              </select>
            </div>

            {/* Name Filter */}
            <div className="flex flex-col min-w-[150px]">
              <label className="text-white mb-1">Name</label>
              <Input
                type="text"
                name="name"
                value={searchName}
                onChange={handleSearchChange}
                placeholder="Search From Name"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 h-fit self-end"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl backdrop-blur-sm">
            <p className="text-xl text-gray-400">No matching event requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`${
                  request.status === "Declined"
                    ? "bg-red-900/30 border border-red-500/50"
                    : "bg-white/10"
                } backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col`}
              >
                {request.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`data:${request.image.type};base64,${request.image.data}`}
                      alt={request.eventName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">
                      {request.eventName}
                    </h3>
                    {request.status === "Declined" && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                        Declined
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-gray-300 text-sm mb-4">
                    <p>
                      <span className="font-medium text-gray-200">Date: </span>
                      {new Date(request.selectedDate).toLocaleDateString()}
                    </p>
                    {request.selectedTime && (
                      <p>
                        <span className="font-medium text-gray-200">
                          Time:{" "}
                        </span>
                        {request.selectedTime}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-200">
                        Location:{" "}
                      </span>
                      {request.location}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">
                        Max Tickets:{" "}
                      </span>
                      {request.maxTickets}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">Type : </span>
                      {request.eventType}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">
                        Club/Society Name:{" "}
                      </span>
                      {request.societyName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-200">
                        Registration Link:{" "}
                      </span>
                      {request.registrationLink}
                    </p>
                  </div>

                  {request.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-200 mb-1">
                        Description:
                      </h4>
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {request.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-black/30 p-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm flex justify-center items-center"
                    disabled={processingIds.includes(request._id)}
                  >
                    {processingIds.includes(request._id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Approve
                  </button>

                  {request.file && (
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        if (
                          request.file &&
                          request.file.type &&
                          request.file.data &&
                          request.file.name
                        ) {
                          link.href = `data:${request.file.type};base64,${request.file.data}`;
                          link.download = request.file.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm flex justify-center items-center"
                    >
                      Download Document
                    </button>
                  )}

                  <button
                    onClick={() => openRejectModal(request._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm flex justify-center items-center"
                    disabled={processingIds.includes(request._id)}
                  >
                    {processingIds.includes(request._id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Event Time</h2>
            <p className="mb-4 text-gray-300">
              Add a specific time for the event:{" "}
              <span className="font-medium text-white">
                {selectedRequest?.eventName}
              </span>
            </p>

            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="HH:MM"
            />

            <div className="flex gap-3">
              <button
                onClick={handleAddTime}
                disabled={savingTime}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex justify-center items-center"
              >
                {savingTime && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setShowTimeModal(false);
                  setSelectedRequest(null);
                  setTimeInput("");
                }}
                disabled={savingTime}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Reject Event Request
            </h2>
            <p className="mb-4 text-gray-300">
              Please provide a reason for rejecting this event request:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter rejection reason here..."
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() =>
                  rejectionId && handleDelete(rejectionId, rejectionReason)
                }
                disabled={!rejectionReason.trim()}
                className={`flex-1 ${
                  !rejectionReason.trim()
                    ? "bg-red-800"
                    : "bg-red-600 hover:bg-red-700"
                } text-white py-2 px-4 rounded-lg font-medium flex justify-center items-center`}
              >
                {processingIds.includes(rejectionId || "") && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Reject Event
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionId(null);
                  setRejectionReason("");
                }}
                disabled={processingIds.includes(rejectionId || "")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
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
