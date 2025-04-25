"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import Card from "@/components/card_news";

export default function LectureSchedule() {
  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({
    course: "",
    lecturer: "",
    time: "",
    room: "",
    department: "",
    day: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLectures() {
      try {
        const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
        const data = await fetcher("lectures", API_KEY);
        setLectures(data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching lectures:", error);
        setLoading(false);
      }
    }
    fetchLectures();
  }, []);

  const handleChange = (e) => {
    setNewLecture({ ...newLecture, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      await axios.post(`${SERVER_ADDRESS}/data/lectures/store`, newLecture, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      setLectures([...lectures, newLecture]);
      setNewLecture({ course: "", lecturer: "", time: "", room: "", department: "", day: "" });
      console.log("Lecture added successfully!");
    } catch (error) {
      console.log("Error adding lecture:", error);
    }
  };

  return (
    <div>
      <Navbar name="NSBM SA: Lecture Scheduling Interface [ADMIN]" />
      <div className="pt-30 flex flex-row items-start justify-between p-10 pb-50">
        {/* Lectures Display */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center mt-5">
              <div className="w-16 h-16 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-50">
              {lectures.map((lec, index) => (
                <Card
                  key={index}
                  title={lec.course}
                  text={`Lecturer: ${lec.lecturer}\nTime: ${lec.time}\nRoom: ${lec.room}\nDay: ${lec.day}\nDepartment: ${lec.department}`}
                  className="flex flex-col p-4 bg-white shadow-lg rounded-lg max-w-xs mx-auto"
                />
              ))}
            </div>
          )}
        </div>

        {/* Lecture Add Form */}
        <div className="fixed right-1 flex-none w-96 p-6 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl h-full">
          <form onSubmit={handleSubmit} className="w-full h-full bg-white/30 p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-3xl text-white mb-4">Add Lecture</h2>

            <input name="course" value={newLecture.course} onChange={handleChange} placeholder="Course Name" required className="form-input" />
            <input name="lecturer" value={newLecture.lecturer} onChange={handleChange} placeholder="Lecturer" required className="form-input" />
            <input name="time" value={newLecture.time} onChange={handleChange} placeholder="Time (e.g. 9-11AM)" required className="form-input" />
            <input name="room" value={newLecture.room} onChange={handleChange} placeholder="Room" required className="form-input" />
            <input name="department" value={newLecture.department} onChange={handleChange} placeholder="Department" required className="form-input" />
            <input name="day" value={newLecture.day} onChange={handleChange} placeholder="Day (e.g. Monday)" required className="form-input" />

            <button type="submit" className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600">
              Add Lecture
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
