import React, { useState } from "react";

const Card = ({ title, text, text2, image, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle the text expansion
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // If the description is too long, we will truncate it and show the "See More" option
  const truncatedText = text.length > 100 ? text.slice(0, 100) + "..." : text;

  return (
    <div className="flex justify-center">
      <div className="w-80 p-6 flex flex-col justify-between bg-white/10 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl border border-white/20 shadow-lg shadow-white/10">
        {image && (
          <img
            src={image} // Remove `{ uri: image }`
            alt={title}
            className="w-full h-24 object-cover rounded-xl"
          />
        )}
        <h2 className="text-2xl font-semibold text-white text-center mt-2">
          {title}
        </h2>

        <p className="text-gray-200 text-base text-center">
          {isExpanded ? text : truncatedText}
        </p>

        {text.length > 100 && (
          <button
            className="text-gray-500 text-sm mt-2 text-center"
            onClick={handleToggle}
          >
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}

        {text2 && (
          <p className="text-gray-200 text-base text-center">{text2}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
