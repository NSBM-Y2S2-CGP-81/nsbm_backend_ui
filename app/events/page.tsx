"use client";
import { useState, useEffect } from "react";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";

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
    }
  };

  const handleEdit = async () => {
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      const formData = new FormData();
      Object.keys(selectedEvent).forEach((key) => {
        formData.append(key, selectedEvent[key]);
      });

      await axios.put(
        `${SERVER_ADDRESS}/data/events/update/${selectedEvent.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "multipart/form-data",
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
    }
  };

  const handleDelete = async (id) => {
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.delete(`${SERVER_ADDRESS}/data/events/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      console.log("Error deleting event:", error);
    }
  };

  const handleSearchChange = (e) => {
    if (e.target.name === "date") {
      setSearchDate(e.target.value);
    } else if (e.target.name === "location") {
      setSearchLocation(e.target.value);
    } else if (e.target.name === "name") {
      setSearchName(e.target.value);
    }
  };

  const clearFilters = () => {
    setSearchDate("");
    setSearchLocation("");
    setSearchName("");
  };

  const filteredEvents = events.filter((event) => {
    const dateMatch = searchDate === "" || event.event_date === searchDate;
    const locationMatch =
      searchLocation === "" || event.event_venue === searchLocation;
    const nameMatch =
      searchName === "" ||
      event.event_name.toLowerCase().includes(searchName.toLowerCase());
    return dateMatch && locationMatch && nameMatch;
  });

  const exportData = () => {
    const csvData = filteredEvents.map((event) => ({
      "Event Name": event.event_name,
      Date: event.event_date,
      Time: event.event_time,
      Venue: event.event_venue,
    }));
    return csvData;
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4">
      {/* TITLE */}
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
                className="rounded-xl w-full h-40 object-cover"
                alt="Event"
              />
              <h3 className="mt-3 text-xl font-semibold">{event.event_name}</h3>
              <div className="text-sm mt-2 space-y-1 text-gray-200">
                <p>Date: {event.event_date}</p>
                <p>Time: {event.event_time}</p>
                <p>Location: {event.event_venue}</p>
                <p>Seats: 50/{event.event_tickets}</p>
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
                  DELETE
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
              onClick={handleEdit}
            >
              Save Changes
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
