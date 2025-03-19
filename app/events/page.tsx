"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import GlassmorphicCard from "@/components/clickableCard";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import Card from "@/components/card";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    event_date: "",
    event_time: "", // New state for time
    event_venue: "",
    event_image: "",
  });
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    async function fetchEvents() {
      try {
        const API_KEY =
          typeof window !== "undefined"
            ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
            : null;
        const event_data = await fetcher("events", API_KEY);
        console.log(event_data);
        setEvents(event_data);
        setLoading(false); // Set loading to false once the data is fetched
      } catch (error) {
        console.log("Error fetching events:", error);
        setLoading(false); // Set loading to false even if there's an error
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
        setNewEvent({ ...newEvent, event_image: reader.result }); // Store Base64 string
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      const eventData = {
        ...newEvent,
      };

      await axios.post(`${SERVER_ADDRESS}/data/events/store`, eventData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      setEvents([...events, newEvent]);
      setNewEvent({
        event_name: "",
        event_date: "",
        event_time: "", // Reset time input
        event_venue: "",
        event_image: "", // Reset image input
      });

      console.log("Event added successfully!", newEvent);
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
      console.log("Event updated successfully!", selectedEvent);
    } catch (error) {
      console.log("Error updating event:", error);
    }
  };

  return (
    <div>
      <Navbar name="NSBM SA: Events Management Interface [ADMIN]" />
      <div className="pt-30 flex flex-col items-center justify-center p-10">
        {/* <h1 className="text-5xl">Currently Available Events</h1> */}

        {/* Loading animation */}
        {loading ? (
          <div className="flex justify-center items-center mt-5">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-50">
            {events.map((event, index) => (
              <Card
                key={index}
                title={event.event_name}
                image={event.event_image}
                text={`Date: ${event.event_date}`}
                text2={`Venue: ${event.event_venue}`}
              >
                <p>Date: {event.event_date}</p>
                <p>Time: {event.event_time}</p> {/* Display time */}
                <p>Venue: {event.event_venue}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-10 p-10 flex-col bg-white/10 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl border border-white/20  shadow-white/10">
        <form onSubmit={handleSubmit} className="">
          <h2 className="text-3xl mb-4">Add New Event</h2>
          <input
            type="text"
            name="event_name"
            value={newEvent.event_name}
            onChange={handleChange}
            placeholder="Event Name"
            className="p-2 mb-2 border rounded bg-ring"
            required
          />
          <input
            type="date"
            name="event_date"
            value={newEvent.event_date}
            onChange={handleChange}
            className="p-2 mb-2 border rounded bg-ring"
            required
          />
          <input
            type="time"
            name="event_time"
            value={newEvent.event_time} // Time input
            onChange={handleChange}
            className="p-2 mb-2 border rounded bg-ring"
            required
          />
          <input
            type="text"
            name="event_venue"
            value={newEvent.event_venue}
            onChange={handleChange}
            placeholder="Event Venue"
            className="p-2 mb-2 border rounded bg-ring"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="p-2 mb-2 border rounded bg-ring"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Event
          </button>
        </form>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl mb-2">{selectedEvent.event_name}</h2>
            <p>Date: {selectedEvent.event_date}</p>
            <p>Time: {selectedEvent.event_time}</p> {/* Display time */}
            <p>Venue: {selectedEvent.event_venue}</p>
            {selectedEvent.event_image && (
              <img
                src={selectedEvent.event_image}
                alt="Event"
                className="mt-2 w-full h-40 object-cover rounded-lg"
              />
            )}
            <button
              className="bg-yellow-500 text-white p-2 mt-4 rounded hover:bg-yellow-600 w-full"
              onClick={() => handleEdit()}
            >
              Edit Event
            </button>
            <button
              className="bg-gray-500 text-white p-2 mt-2 rounded hover:bg-gray-600 w-full"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
