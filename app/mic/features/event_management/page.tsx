"use client";
import { useState, useEffect } from "react";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import Navbar from "@/components/navbar";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineStatusOnline,
} from "react-icons/hi";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import Image from "next/image";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    event_date: "",
    event_time: "",
    event_venue: "",
    event_image: "",
    event_type: "",
    event_held_by: "",
    event_tickets: "",
    event_status: "Upcoming",
  });
  const [loading, setLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEventType, setSearchEventType] = useState("");
  const [searchSociety, setSearchSociety] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<
    Record<string, number>
  >({});
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const API_KEY =
          typeof window !== "undefined"
            ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
            : null;
        const event_data = await fetcher("events", API_KEY);
        setEvents(event_data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching events:", error);
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchRegistrationCounts = async () => {
      const counts: Record<string, number> = {};
      for (const event of events) {
        counts[event._id] = await checkEventRegs(event);
      }
      setRegistrationCounts(counts);
    };

    if (events.length > 0) {
      fetchRegistrationCounts();
    }
  }, [events]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, event_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      // Get the creator's email from localStorage or another source
      const creatorEmail = localStorage.getItem("NEXT_PUBLIC_USER_EMAIL") || "";
      
      // Format the time to HH:MM:SS
      const timeValue = newEvent.event_time;
      const formattedTime = timeValue.includes(':') && timeValue.split(':').length === 2
        ? `${timeValue}:00`
        : timeValue;

      // Map the event data to the correct format for event_requests
      const requestData = {
        eventName: newEvent.event_name,
        description: newEvent.event_image, // Using event_image field as description
        selectedDate: newEvent.event_date, // YYYY-MM-DD
        selectedTime: formattedTime, // HH:MM:SS
        location: newEvent.event_venue,
        maxTickets: newEvent.event_tickets ? parseInt(newEvent.event_tickets, 10) : 0,
        eventType: newEvent.event_type,
        societyName: newEvent.event_type === "A Stall" ? "" : newEvent.event_held_by,
        creatorEmail: creatorEmail,
      };

      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.post(`${SERVER_ADDRESS}/data/event_requests/store`, requestData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      
      // Reset form
      setNewEvent({
        event_name: "",
        event_date: "",
        event_time: "",
        event_venue: "",
        event_image: "",
        event_type: "",
        event_held_by: "",
        event_tickets: "",
        event_status: "Upcoming",
      });
      
      // Show success notification
      toast.success("Event request submitted successfully!");
      
      // Close the modal
      setShowCreateEventModal(false);
      
      // Optionally refresh the page
      // Adding a small delay before reload for the toast to be visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.log("Error submitting event request:", error);
      toast.error("Failed to submit event request. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    setButtonLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

      if (!selectedEvent) return;

      // Create a copy of the event without the _id field
      const { _id, ...updateData } = selectedEvent;

      await axios.put(
        `${SERVER_ADDRESS}/data/events/update/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? selectedEvent : event,
        ),
      );
      setSelectedEvent(null);
    } catch (error) {
      console.log("Error updating event:", error);
    } finally {
      setButtonLoading(false);
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    setButtonLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.delete(`${SERVER_ADDRESS}/data/events/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      // Update events state after deletion
      setEvents(events.filter((event) => event._id !== id));
    } catch (error) {
      console.log("Error deleting event:", error);
    } finally {
      setButtonLoading(false);
      window.location.reload();
    }
  };

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
    } else if (e.target.name === "status") {
      setSearchStatus(e.target.value);
    }
  };

  const checkEventRegs = async (event: any) => {
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      const response = await axios.get(
        `${SERVER_ADDRESS}/data/event_registrations/count?field=event_id&value=${event._id}&event_data_get=${event._id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );
      return response.data.count || 0;
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  const clearFilters = () => {
    setSearchDate("");
    setSearchLocation("");
    setSearchName("");
    setSearchEventType("");
    setSearchSociety("");
    setSearchStatus("");
  };

  const filteredEvents = events.filter((event) => {
    const dateMatch = searchDate === "" || event.event_date === searchDate;
    const locationMatch =
      searchLocation === "" ||
      searchLocation === "All" ||
      new RegExp(searchLocation, "i").test(event.event_venue);
    const nameMatch =
      searchName === "" ||
      event.event_name.toLowerCase().includes(searchName.toLowerCase());
    const eventTypeMatch =
      searchEventType === "" ||
      searchEventType === "All" ||
      event.event_type === searchEventType;
    const societyMatch =
      searchSociety === "" ||
      searchSociety === "All" ||
      event.event_held_by === searchSociety;
    const statusMatch =
      searchStatus === "" ||
      searchStatus === "All" ||
      event.event_status === searchStatus;

    return (
      dateMatch &&
      locationMatch &&
      nameMatch &&
      eventTypeMatch &&
      societyMatch &&
      statusMatch
    );
  });

  const exportData = () => {
    const csvData = filteredEvents.map((event) => ({
      "Event Name": event.event_name,
      Date: event.event_date,
      Time: event.event_time,
      Venue: event.event_venue,
      Type: event.event_type || "Unknown",
      "Held By": event.event_held_by || "Unknown",
      Status: event.event_status || "Unknown",
      Tickets: event.event_tickets,
      Registrations: registrationCounts[event._id] || 0,
    }));
    return csvData;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-blue-500";
      case "ongoing":
        return "bg-green-500";
      case "completed":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      case "rescheduled":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0D14] to-[#111827] text-white p-4">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-25"
      >
        <Navbar name="Event Management" />
      </motion.div>

      {/* <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl font-bold mb-6 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
      >
        UPCOMING EVENTS
      </motion.h2> */}

      {/* Filters Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mb-4 "
      >
        <button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <FiFilter className="inline" />
          <span>{isFiltersVisible ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </motion.div>

      {/* Filters - Search */}
      <AnimatePresence>
        {isFiltersVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div className="flex justify-between flex-wrap gap-4 bg-white/5 p-6 rounded-xl mb-6 backdrop-blur-md border border-white/10 shadow-lg">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Date */}
                <div className="flex flex-col min-w-[150px]">
                  <label className="text-gray-300 mb-2 flex items-center gap-1">
                    <HiOutlineCalendar className="text-blue-400" />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={searchDate}
                    onChange={handleSearchChange}
                    className="bg-white/10 text-white p-2.5 rounded-lg backdrop-blur-lg border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col min-w-[150px]">
                  <label className="text-gray-300 mb-2 flex items-center gap-1">
                    <HiOutlineLocationMarker className="text-blue-400" />
                    <span>Location</span>
                  </label>
                  <select
                    name="location"
                    value={searchLocation}
                    onChange={handleSearchChange}
                    className="bg-white/10 text-white p-2.5 rounded-lg backdrop-blur-lg border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 appearance-none"
                  >
                    <option className="bg-gray-800 text-white">All</option>
                    <option className="bg-gray-800 text-white">General</option>
                    <option className="bg-gray-800 text-white">FOC</option>
                    <option className="bg-gray-800 text-white">FOB</option>
                    <option className="bg-gray-800 text-white">FOE</option>
                    <option className="bg-gray-800 text-white">
                      Auditorium
                    </option>
                    <option className="bg-gray-800 text-white">Ground</option>
                    <option className="bg-gray-800 text-white">Entrance</option>
                    <option className="bg-gray-800 text-white">Edge</option>
                    <option className="bg-gray-800 text-white">Finagle</option>
                  </select>
                </div>
                {/* Status */}
                <div className="flex flex-col min-w-[150px]">
                  <label className="text-gray-300 mb-2 flex items-center gap-1">
                    <HiOutlineStatusOnline className="text-blue-400" />
                    <span>Status</span>
                  </label>
                  <select
                    name="status"
                    value={searchStatus}
                    onChange={handleSearchChange}
                    className="bg-white/10 text-white p-2.5 rounded-lg backdrop-blur-lg border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 appearance-none"
                  >
                    <option className="bg-gray-800 text-white">All</option>
                    <option className="bg-gray-800 text-white">Upcoming</option>
                    <option className="bg-gray-800 text-white">Ongoing</option>
                    <option className="bg-gray-800 text-white">
                      Completed
                    </option>
                    <option className="bg-gray-800 text-white">
                      Cancelled
                    </option>
                    <option className="bg-gray-800 text-white">
                      Rescheduled
                    </option>
                  </select>
                </div>

                {/* Name */}
                <div className="flex flex-col min-w-[200px]">
                  <label className="text-gray-300 mb-2 flex items-center gap-1">
                    <FiSearch className="text-blue-400" />
                    <span>Name</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={searchName}
                    onChange={handleSearchChange}
                    placeholder="Search From Name"
                    className="bg-white/10 text-white border-white/20 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-lg hover:from-gray-800 hover:to-gray-950 transition-all h-fit self-end flex items-center gap-2 shadow-md"
                onClick={clearFilters}
              >
                <span>Clear Filters</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters - Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-between flex-wrap gap-2 bg-white/5 p-4 rounded-xl mb-6 backdrop-blur border border-white/10 shadow-lg"
      >
        <div className="text-sm text-gray-300">
          {filteredEvents.length} events found
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-md"
            onClick={() => setShowCreateEventModal(true)}
          >
            <FiPlus />
            <span>CREATE EVENT</span>
          </motion.button>
          <CSVLink
            data={exportData()}
            filename="events.csv"
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all flex items-center gap-2 shadow-md"
          >
            <FiDownload />
            <span>EXPORT</span>
          </CSVLink>
        </div>
      </motion.div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 border-4 border-blue-400 border-opacity-20 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white/5 rounded-2xl backdrop-blur-sm p-5 shadow-xl flex flex-col border border-white/10 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {event.event_image && (
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={event.event_image}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={event.event_name}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute bottom-0 right-0 p-2">
                      <span
                        className={`text-xs font-medium py-1 px-3 rounded-full ${getStatusColor(event.event_status)}`}
                      >
                        {event.event_status || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2 text-white">
                  {event.event_name}
                </h3>

                <div className="text-sm space-y-2 text-gray-300 flex-grow">
                  <p className="flex items-center gap-2">
                    <HiOutlineCalendar className="text-blue-400" />
                    <span>{event.event_date}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineClock className="text-blue-400" />
                    <span>{event.event_time}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineLocationMarker className="text-blue-400" />
                    <span>{event.event_venue}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineTag className="text-blue-400" />
                    <span>{event.event_type || "Unknown"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineUserGroup className="text-blue-400" />
                    <span>{event.event_held_by || "Unknown"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineStatusOnline className="text-blue-400" />
                    <span>
                      Registrations: {registrationCounts[event._id] || 0}/
                      {event.event_tickets || "unlimited"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center shadow-md"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <FiEdit />
                    <span>EDIT</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* No events found message */}
      {!loading && filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-gray-400"
        >
          <p className="text-2xl font-light">
            No events found matching your filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-400 hover:text-blue-300 underline"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md text-white border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Edit Event
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.event_name}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        event_name: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Event Name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedEvent.event_date}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        event_date: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedEvent.event_time}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        event_time: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.event_venue}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        event_venue: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Venue"
                  />
                </div>

                {/* Status dropdown */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Event Status
                  </label>
                  <select
                    value={selectedEvent.event_status || "Upcoming"}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        event_status: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option>Upcoming</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                    <option>Rescheduled</option>
                  </select>
                </div>
              </div>

              {selectedEvent.event_image && (
                <div className="mt-6 relative rounded-lg overflow-hidden h-48">
                  <Image
                    src={selectedEvent.event_image}
                    alt="Event"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="mt-6 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-lg w-full font-medium shadow-lg flex items-center justify-center gap-2"
                  onClick={() => handleEdit(selectedEvent._id)}
                >
                  {buttonLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      <FiEdit />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg w-full font-medium transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md text-white border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Create New Event
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateEventModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="event_name"
                    value={newEvent.event_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Event Name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={newEvent.event_date}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="event_time"
                    value={newEvent.event_time}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Venue *
                  </label>
                  <select
                    name="event_venue"
                    value={newEvent.event_venue}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option value="" className="bg-gray-800">Select a venue</option>
                    <option value="General" className="bg-gray-800">General</option>
                    <option value="FOC" className="bg-gray-800">FOC</option>
                    <option value="FOB" className="bg-gray-800">FOB</option>
                    <option value="FOE" className="bg-gray-800">FOE</option>
                    <option value="Auditorium" className="bg-gray-800">Auditorium</option>
                    <option value="Ground" className="bg-gray-800">Ground</option>
                    <option value="Entrance" className="bg-gray-800">Entrance</option>
                    <option value="Edge" className="bg-gray-800">Edge</option>
                    <option value="Finagle" className="bg-gray-800">Finagle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Event Type
                  </label>
                  <select
                    name="event_type"
                    value={newEvent.event_type}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option value="" className="bg-gray-800">Select event type</option>
                    <option value="Event Held by a Club" className="bg-gray-800">Event Held by a Club</option>
                    <option value="Event Held by a Society" className="bg-gray-800">Event Held by a Society</option>
                    <option value="A Stall" className="bg-gray-800">A Stall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Society/Club
                  </label>
                  <select
                    name="event_held_by"
                    value={newEvent.event_held_by}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option value="" className="bg-gray-800">Select society/club</option>
                    <option value="FOSS" className="bg-gray-800">FOSS</option>
                    <option value="IEEE" className="bg-gray-800">IEEE</option>
                    <option value="NSBM" className="bg-gray-800">NSBM</option>
                    <option value="Rotaract" className="bg-gray-800">Rotaract</option>
                    <option value="Leo Club" className="bg-gray-800">Leo Club</option>
                    <option value="AIESEC" className="bg-gray-800">AIESEC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Maximum Tickets (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    name="event_tickets"
                    value={newEvent.event_tickets}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Maximum number of tickets"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Event Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {newEvent.event_image && (
                  <div className="mt-4 relative rounded-lg overflow-hidden h-40">
                    <Image
                      src={newEvent.event_image}
                      alt="Event Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="mt-6 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg w-full font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    {buttonLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <>
                        <FiPlus />
                        <span>Create Event</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg w-full font-medium transition-colors"
                    onClick={() => setShowCreateEventModal(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}