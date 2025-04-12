"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDatabase,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiCode,
  FiTable,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { RiDatabaseLine } from "react-icons/ri";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function MongoDBInterface() {
  const [selectedCollection, setSelectedCollection] = useState("users");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editedDocument, setEditedDocument] = useState(null);
  const [showJsonView, setShowJsonView] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [documentUpdating, setDocumentUpdating] = useState(false);

  const collections = [
    "users",
    "students",
    "lecturers",
    "staff",
    "vendors",
    "events",
    "event_registrations",
    "timetable",
    "food_orders",
    "food_order_items",
    "queue_management",
    "campus_facilities",
    "payments",
    "todays_pick",
    "news",
    "crowd_uplink",
  ];

  useEffect(() => {
    fetchDocuments();
  }, [selectedCollection, page, limit]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      if (!API_KEY) {
        throw new Error("API key not found");
      }

      const response = await fetcher(selectedCollection, API_KEY);
      setDocuments(response);

      // Fetch count separately
      const countResponse = await axios.get(
        `${SERVER_ADDRESS}/data/${selectedCollection}/count`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );
      setDocumentCount(countResponse.data.count || 0);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setLoading(false);
    }
  };

  const handleCollectionChange = (collection) => {
    setSelectedCollection(collection);
    setPage(1);
    setSearchQuery("");
    setSelectedDocument(null);
    setEditedDocument(null);
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    setEditedDocument(JSON.parse(JSON.stringify(doc))); // Deep copy
  };

  const handleUpdateDocument = async () => {
    if (!editedDocument) return;

    setDocumentUpdating(true);
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      if (!API_KEY) {
        throw new Error("API key not found");
      }

      const { _id, ...updateData } = editedDocument;

      await axios.put(
        `${SERVER_ADDRESS}/data/${selectedCollection}/update/${_id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Update the documents list
      setDocuments(
        documents.map((doc) => (doc._id === _id ? editedDocument : doc)),
      );

      setSelectedDocument(null);
      setEditedDocument(null);
      fetchDocuments(); // Refresh data
    } catch (err) {
      console.error("Error updating document:", err);
      setError("Failed to update document. Please try again.");
    } finally {
      setDocumentUpdating(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      if (!API_KEY) {
        throw new Error("API key not found");
      }

      await axios.delete(
        `${SERVER_ADDRESS}/data/${selectedCollection}/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );

      // Update the documents list
      setDocuments(documents.filter((doc) => doc._id !== id));
      if (selectedDocument && selectedDocument._id === id) {
        setSelectedDocument(null);
        setEditedDocument(null);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete document. Please try again.");
    }
  };

  const handleEditChange = (key, value) => {
    if (!editedDocument) return;

    // Handle nested objects with dot notation
    if (key.includes(".")) {
      const keys = key.split(".");
      const newDoc = { ...editedDocument };
      let current = newDoc;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      setEditedDocument(newDoc);
    } else {
      setEditedDocument({ ...editedDocument, [key]: value });
    }
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;

    // Convert document to string to enable search across all fields
    const docString = JSON.stringify(doc).toLowerCase();
    return docString.includes(searchQuery.toLowerCase());
  });

  // Generate CSV data for export
  const exportData = () => {
    return filteredDocuments;
  };

  // Recursive function to render form inputs for nested objects
  const renderFormInputs = (obj, prefix = "") => {
    if (!obj) return null;

    return Object.keys(obj).map((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      // Skip the _id field as it's not editable
      if (key === "_id") return null;

      // Handle nested objects recursively
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return (
          <motion.div
            key={fullKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-4 border-l-2 border-indigo-700 pl-3 my-3"
          >
            <h4 className="font-medium text-indigo-300 flex items-center">
              <span className="mr-1">📁</span> {key}:
            </h4>
            {renderFormInputs(value, fullKey)}
          </motion.div>
        );
      }

      // Handle arrays as JSON strings
      if (Array.isArray(value)) {
        return (
          <motion.div
            key={fullKey}
            className="mb-3 bg-gray-800/40 p-3 rounded-lg border border-gray-700"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-sm font-medium text-indigo-300 mb-2 flex items-center">
              <span className="mr-1">🔢</span> {key}:
            </label>
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const newValue = JSON.parse(e.target.value);
                  handleEditChange(fullKey, newValue);
                } catch (err) {
                  // Invalid JSON, keep the text as is for now
                  console.log("Invalid JSON", err);
                }
              }}
              className="w-full p-3 border rounded-lg bg-gray-900/60 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={3}
            />
          </motion.div>
        );
      }

      // Render appropriate input for different types
      return (
        <motion.div
          key={fullKey}
          className="mb-3"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-indigo-300 mb-1.5 flex items-center">
            {typeof value === "boolean" && <span className="mr-1">🔘</span>}
            {typeof value === "number" && <span className="mr-1">🔢</span>}
            {typeof value === "string" && <span className="mr-1">✏️</span>}
            {key}:
          </label>
          {typeof value === "boolean" ? (
            <select
              value={value.toString()}
              onChange={(e) =>
                handleEditChange(fullKey, e.target.value === "true")
              }
              className="w-full p-2.5 border rounded-lg bg-gray-800/80 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <Input
              type={typeof value === "number" ? "number" : "text"}
              value={value === null ? "" : value}
              onChange={(e) => {
                const newValue =
                  typeof value === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value;
                handleEditChange(fullKey, newValue);
              }}
              className="w-full p-2.5 border rounded-lg bg-gray-800/80 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0D14] to-[#14182e] text-white p-6">
      <div className="pb-20">
        <Navbar name="MongoDB Interface" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {/* Left column - Collections */}
        <motion.div
          className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center text-indigo-300">
            <FiDatabase className="mr-2 text-indigo-400" /> Collections
          </h2>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {collections.map((collection) => (
              <motion.button
                key={collection}
                onClick={() => handleCollectionChange(collection)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                  selectedCollection === collection
                    ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-900/30"
                    : "hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RiDatabaseLine className="mr-2 text-indigo-400" />
                {collection}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Middle column - Documents */}
        <div className="md:col-span-3">
          <motion.div
            className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center">
                <HiOutlineDocumentText
                  className="mr-2 text-indigo-400"
                  size={24}
                />
                {selectedCollection.charAt(0).toUpperCase() +
                  selectedCollection.slice(1)}
                {documentCount > 0 && (
                  <span className="ml-2 text-sm bg-indigo-900/50 text-indigo-300 px-2.5 py-1 rounded-full">
                    {documentCount} documents
                  </span>
                )}
              </h2>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-800/70 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full md:w-60"
                  />
                </div>
                <Button
                  onClick={() => setShowJsonView(!showJsonView)}
                  variant="outline"
                  className="flex items-center gap-2 bg-gray-800/70 border-gray-700 hover:bg-gray-700 text-white"
                >
                  {showJsonView ? (
                    <FiTable className="text-indigo-400" />
                  ) : (
                    <FiCode className="text-indigo-400" />
                  )}
                  {showJsonView ? "Table View" : "JSON View"}
                </Button>
                <CSVLink
                  data={exportData()}
                  filename={`${selectedCollection}.csv`}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-900/30"
                >
                  <FiDownload /> EXPORT
                </CSVLink>
              </div>
            </div>

            {error && (
              <motion.div
                className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-4 text-red-200 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </motion.div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="w-12 h-12 border-4 absolute top-2 left-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : showJsonView ? (
              // JSON View
              <motion.div
                className="bg-gray-900/80 p-5 rounded-xl border border-gray-800 max-h-[60vh] overflow-y-auto custom-scrollbar shadow-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(filteredDocuments, null, 2)}
                </pre>
              </motion.div>
            ) : (
              // Table View
              <motion.div
                className="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar rounded-xl shadow-xl border border-gray-800/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <table className="min-w-full bg-gray-900/40 backdrop-blur-sm rounded-lg">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 text-left border-b border-gray-800">
                      {filteredDocuments.length > 0 &&
                        Object.keys(filteredDocuments[0])
                          .filter(
                            (key) =>
                              key !== "_id" &&
                              !key.includes(".") &&
                              typeof filteredDocuments[0][key] !== "object",
                          )
                          .map((key) => (
                            <th
                              key={key}
                              className="py-3 px-4 text-left text-xs font-semibold text-indigo-300 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                      <th className="py-3 px-4 text-left text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredDocuments.map((doc, idx) => (
                      <motion.tr
                        key={doc._id}
                        className={`${
                          idx % 2 === 0 ? "bg-gray-900/20" : "bg-gray-900/40"
                        } hover:bg-indigo-900/20 cursor-pointer transition-colors duration-150`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        whileHover={{
                          backgroundColor: "rgba(79, 70, 229, 0.1)",
                        }}
                      >
                        {Object.keys(doc)
                          .filter(
                            (key) =>
                              key !== "_id" &&
                              !key.includes(".") &&
                              typeof doc[key] !== "object",
                          )
                          .map((key) => (
                            <td
                              key={key}
                              className="py-3 px-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] font-light text-gray-300"
                              onClick={() => handleDocumentSelect(doc)}
                            >
                              {typeof doc[key] === "boolean" ? (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${doc[key] ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}
                                >
                                  {doc[key].toString()}
                                </span>
                              ) : doc[key] === null ||
                                doc[key] === undefined ? (
                                <span className="text-gray-500 italic">
                                  null
                                </span>
                              ) : typeof doc[key] === "object" ? (
                                <span className="text-purple-400 bg-purple-900/20 px-2 py-1 rounded text-xs">
                                  [Object]
                                </span>
                              ) : (
                                doc[key].toString()
                              )}
                            </td>
                          ))}
                        <td className="py-2 px-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <motion.button
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 shadow-lg shadow-amber-900/20"
                              onClick={() => handleDocumentSelect(doc)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiEdit2 size={14} /> Edit
                            </motion.button>
                            <motion.button
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 shadow-lg shadow-red-900/20"
                              onClick={() => handleDeleteDocument(doc._id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiTrash2 size={14} /> Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Pagination controls */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-gray-800/80 text-white border border-gray-700 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    page <= 1
                      ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                  }`}
                  whileHover={page > 1 ? { scale: 1.05 } : {}}
                  whileTap={page > 1 ? { scale: 0.95 } : {}}
                >
                  <FiChevronLeft /> Previous
                </motion.button>
                <span className="px-4 py-2 bg-gray-800/80 text-white rounded-lg border border-gray-700">
                  Page {page} of {Math.max(1, Math.ceil(documentCount / limit))}
                </span>
                <motion.button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(documentCount / limit)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    page >= Math.ceil(documentCount / limit)
                      ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                  }`}
                  whileHover={
                    page < Math.ceil(documentCount / limit)
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    page < Math.ceil(documentCount / limit)
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  Next <FiChevronRight />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Document Edit Form */}
          <AnimatePresence>
            {selectedDocument && (
              <motion.div
                className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 flex items-center">
                    <FiEdit2 className="mr-2 text-amber-500" size={22} /> Edit
                    Document
                  </h2>
                  <motion.button
                    onClick={() => {
                      setSelectedDocument(null);
                      setEditedDocument(null);
                    }}
                    className="text-gray-400 hover:text-white bg-gray-800/80 rounded-full p-2 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </div>

                <div className="mb-5 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-sm text-amber-400 mb-1 font-medium">
                    Document ID:
                  </p>
                  <p className="font-mono text-gray-300 text-sm bg-gray-800/80 p-3 rounded-lg select-all">
                    {selectedDocument._id}
                  </p>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                  {renderFormInputs(editedDocument)}
                </div>

                <div className="flex justify-end mt-6 space-x-3 border-t border-gray-800 pt-5">
                  <motion.button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    onClick={() => {
                      setSelectedDocument(null);
                      setEditedDocument(null);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className={`bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-900/30 ${
                      documentUpdating ? "opacity-80" : ""
                    }`}
                    onClick={handleUpdateDocument}
                    disabled={documentUpdating}
                    whileHover={{ scale: documentUpdating ? 1 : 1.02 }}
                    whileTap={{ scale: documentUpdating ? 1 : 0.98 }}
                  >
                    {documentUpdating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
