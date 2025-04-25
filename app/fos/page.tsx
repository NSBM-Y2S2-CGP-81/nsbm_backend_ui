"use client";
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Lecture = {
  id: string;
  title: string;
  batch: string;
  day: string;
  time: string;
  endTime: string;
};

const batchColors: Record<string, string> = {
  'Batch A': 'bg-red-300',
  'Batch B': 'bg-blue-300',
  'Batch C': 'bg-yellow-300',
  'Batch D': 'bg-green-300',
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const LectureScheduler: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([
    { id: uuidv4(), title: 'Science', batch: 'Batch A', day: 'Mon', time: '09:30', endTime: '11:20' },
    { id: uuidv4(), title: 'Marketing', batch: 'Batch B', day: 'Wed', time: '11:30', endTime: '12:30' },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editLecture, setEditLecture] = useState<Lecture | null>(null);

  const [formData, setFormData] = useState<Omit<Lecture, 'id'>>({
    title: '',
    batch: 'Batch A',
    day: 'Mon',
    time: '09:00',
    endTime: '10:00',
  });

  const openForm = (lecture?: Lecture) => {
    if (lecture) {
      setEditLecture(lecture);
      setFormData({ ...lecture });
    } else {
      setEditLecture(null);
      setFormData({ title: '', batch: 'Batch A', day: 'Mon', time: '09:00', endTime: '10:00' });
    }
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (editLecture) {
      setLectures((prev) =>
        prev.map((lec) => (lec.id === editLecture.id ? { ...editLecture, ...formData } : lec))
      );
    } else {
      setLectures((prev) => [...prev, { ...formData, id: uuidv4() }]);
    }
    setFormOpen(false);
  };

  const deleteLecture = (id: string) => {
    setLectures((prev) => prev.filter((lec) => lec.id !== id));
  };

  const lecturesByDay = (day: string) => lectures.filter((lec) => lec.day === day);

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Lecture Scheduling</h1>
      <div className="grid grid-cols-5 gap-4 mb-4">
        {days.map((day) => (
          <div key={day} className="bg-gray-100 rounded-lg p-2">
            <h2 className="text-lg font-semibold mb-2">{day}</h2>
            {lecturesByDay(day).map((lec) => (
              <div key={lec.id} className={`p-2 mb-2 rounded shadow ${batchColors[lec.batch]}`}>
                <p className="font-medium">{lec.title}</p>
                <p className="text-sm">{lec.time} - {lec.endTime}</p>
                <p className="text-xs italic">{lec.batch}</p>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => openForm(lec)} className="text-xs text-blue-700 underline">Edit</button>
                  <button onClick={() => deleteLecture(lec.id)} className="text-xs text-red-700 underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={() => openForm()} className="bg-blue-500 text-white px-4 py-2 rounded">
        + Add Lecture
      </button>

      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-96 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{editLecture ? 'Edit Lecture' : 'Add Lecture'}</h2>
            <input
              className="w-full border px-2 py-1 mb-2"
              placeholder="Lecture Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <select
              className="w-full border px-2 py-1 mb-2"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
            >
              {Object.keys(batchColors).map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
            <select
              className="w-full border px-2 py-1 mb-2"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            >
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <div className="flex gap-2 mb-2">
              <input
                type="time"
                className="border px-2 py-1 w-1/2"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
              <input
                type="time"
                className="border px-2 py-1 w-1/2"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="px-4 py-1 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-1 bg-blue-600 text-white rounded">
                {editLecture ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureScheduler;
