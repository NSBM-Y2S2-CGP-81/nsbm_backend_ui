"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import fetcher from "@/components/services/fetcher";
import axios from "axios";
import SERVER_ADDRESS from "@/config";
import Card from "@/components/card_news";

export default function Home() {
  const [news, setNews] = useState([]);
  const [newNews, setNewNews] = useState({
    news_title: "",
    news_content: "",
    image: "",
  });
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    async function fetchNews() {
      try {
        const API_KEY =
          typeof window !== "undefined"
            ? localStorage.getItem("NEXT_PUBLIC_SYS_API")
            : null;
        const news_data = await fetcher("news", API_KEY);
        console.log(news_data);
        setNews(
          news_data.map((newsItem) => ({
            title: newsItem.news_title,
            content: newsItem.news_content,
            image: newsItem.image,
          })),
        );
        setLoading(false);
      } catch (error) {
        console.log("Error fetching news:", error);
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const handleChange = (e) => {
    setNewNews({ ...newNews, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNews({ ...newNews, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_KEY = localStorage.getItem("NEXT_PUBLIC_SYS_API");
      const newsData = { ...newNews };

      await axios.post(`${SERVER_ADDRESS}/data/news/store`, newsData, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      setNews([...news, newNews]);
      setNewNews({
        news_title: "",
        news_content: "",
        image: "", // Reset image input
      });

      console.log("News added successfully!", newNews);
    } catch (error) {
      console.log("Error adding news:", error);
    }
  };

  return (
    <div>
      <Navbar name="NSBM SA: News Management Interface [ADMIN]" />
      <div className="pt-30 flex flex-row items-start justify-between p-10 pb-50">
        {/* Left side: News */}
        <div className="flex-1">
          {/* Loading animation */}
          {loading ? (
            <div className="flex justify-center items-center mt-5">
              <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-50">
              {news.map((newsItem, index) => (
                <Card
                  key={index}
                  title={newsItem.title}
                  image={newsItem.image}
                  text={newsItem.content}
                  className="flex flex-col p-4 bg-white shadow-lg rounded-lg max-w-xs mx-auto"
                >
                  <p className="text-gray-700 text-sm">{newsItem.content}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Add News Form */}
        <div className="fixed right-1 flex-none w-96 p-6 bg-black/50 backdrop-blur-xl backdrop-saturate-200 rounded-2xl border border-white/20 shadow-xl h-full">
          <form
            onSubmit={handleSubmit}
            className="w-full h-full bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg space-y-4 backdrop-saturate-200"
          >
            <h2 className="text-3xl text-white mb-4">Add News</h2>
            <input
              type="text"
              name="news_title"
              value={newNews.news_title}
              onChange={handleChange}
              placeholder="News Title"
              className="w-full p-2 mb-2 border border-gray-400 rounded bg-transparent text-white focus:outline-none"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full p-2 mb-2 border border-gray-400 rounded bg-transparent text-white"
            />
            <textarea
              name="news_content"
              value={newNews.news_content}
              onChange={handleChange}
              placeholder="News Content"
              className="w-full h-56 p-2 mb-2 border border-gray-400 rounded bg-transparent text-white focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full  bg-blue-500 text-white p-20 rounded hover:bg-blue-600 focus:outline-none"
            >
              Add News
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
