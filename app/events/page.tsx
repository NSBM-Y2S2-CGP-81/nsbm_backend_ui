"use client";
import { useState, useEffect } from "react";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import Navbar from "@/components/navbar";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    event_date: "",
    event_time: "",
    event_venue: "",
    event_image: "",
  });
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEventType, setSearchEventType] = useState("");
  const [searchSociety, setSearchSociety] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState({});

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
      const counts = {};
      for (const event of events) {
        counts[event._id] = await checkEventRegs(event);
      }
      setRegistrationCounts(counts);
    };

    if (events.length > 0) {
      fetchRegistrationCounts();
    }
  }, [events]);

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, event_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.post(`${SERVER_ADDRESS}/data/events/store`, newEvent, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      setEvents([...events, newEvent]);
      setNewEvent({
        event_name: "",
        event_date: "",
        event_time: "",
        event_venue: "",
        event_image: "",
      });
    } catch (error) {
      console.log("Error adding event:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEdit = async (id) => {
    setButtonLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");

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

  const handleDelete = async (id) => {
    setButtonLoading(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.delete(`${SERVER_ADDRESS}/data/events/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      await fetchEvents();
      setEvents(events.filter((event) => event._id !== id));
    } catch (error) {
      console.log("Error deleting event:", error);
    } finally {
      setButtonLoading(false);
      window.location.reload();
    }
  };

  const handleSearchChange = (e) => {
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

  const checkEventRegs = async (event) => {
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

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
      <div className="pb-35">
        <Navbar name="Event Management" />
      </div>

      <h2 className="text-2xl font-semibold mb-4 tracking-wide">
        UPCOMING EVENTS
      </h2>

      {/* Filters - Search */}
      <div className="flex justify-between flex-wrap gap-2 bg-white/10 p-4 rounded-xl mb-6 backdrop-blur">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date */}
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

          {/* Location */}
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

          {/* Event Type */}
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

          {/* Society */}
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

          {/* Status */}
          <div className="flex flex-col min-w-[150px]">
            <label className="text-white mb-1">Status</label>
            <select
              name="status"
              value={searchStatus}
              onChange={handleSearchChange}
              className="bg-gray-700 text-white p-2 rounded-md appearance-none"
            >
              <option className="bg-gray-700 text-white">All</option>
              <option className="bg-gray-700 text-white">Upcoming</option>
              <option className="bg-gray-700 text-white">Ongoing</option>
              <option className="bg-gray-700 text-white">Completed</option>
              <option className="bg-gray-700 text-white">Cancelled</option>
              <option className="bg-gray-700 text-white">Rescheduled</option>
            </select>
          </div>

          {/* Name */}
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

      {/* Filters - Export */}
      <div className="flex justify-between flex-wrap gap-2 bg-white/10 p-4 rounded-xl mb-6 backdrop-blur">
        {/* Other filters can be added here */}
        <CSVLink
          data={exportData()}
          filename="events.csv"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-fit self-end"
        >
          EXPORT
        </CSVLink>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white/10 rounded-2xl backdrop-blur p-4 shadow-lg flex flex-col items-center"
            >
              <img
                src={event.event_image}
                className="rounded-xl w-70 h-40 object-cover"
                alt="Event"
              />

              <h3 className="mt-3 text-xl font-semibold">{event.event_name}</h3>
              <div className="text-sm mt-2 space-y-1 text-gray-200">
                <p>Date: {event.event_date}</p>
                <p>Time: {event.event_time}</p>
                <p>Location: {event.event_venue}</p>
                <p>Type: {event.event_type || "Unknown"}</p>
                <p>Held by: {event.event_held_by || "Unknown"}</p>
                <p>Status: {event.event_status || "Unknown"}</p>
                <p>
                  Registrations: {registrationCounts[event._id] || 0}/
                  {event.event_tickets || "unlimited"}
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md"
                  onClick={() => setSelectedEvent(event)}
                >
                  EDIT
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
                  onClick={() => handleDelete(event._id)}
                >
                  {buttonLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin"></div>
                  ) : (
                    "DELETE"
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96 text-black">
            <h2 className="text-2xl mb-4 font-semibold text-center">
              Edit Event
            </h2>
            <input
              type="text"
              value={selectedEvent.event_name}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  event_name: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
              placeholder="Event Name"
            />
            <input
              type="date"
              value={selectedEvent.event_date}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  event_date: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="time"
              value={selectedEvent.event_time}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  event_time: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              value={selectedEvent.event_venue}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  event_venue: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
              placeholder="Venue"
            />
            {selectedEvent.event_image && (
              <img
                src={selectedEvent.event_image}
                alt="Event"
                className="mt-4 w-full h-40 object-cover rounded-lg"
              />
            )}
            <button
              className="bg-yellow-500 text-white p-2 mt-4 rounded hover:bg-yellow-600 w-full"
              onClick={() => {
                console.log(selectedEvent._id);
                handleEdit(selectedEvent._id);
              }}
            >
              {buttonLoading ? (
                <div className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin mx-auto"></div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              className="bg-gray-600 text-white p-2 mt-2 rounded hover:bg-gray-700 w-full"
              onClick={() => setSelectedEvent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
