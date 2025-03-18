import React from "react";

const GlassmorphicCard = ({ title, text, buttonText, onClick }) => {
  return (
    <div className="flex">
      <div className="w-80 h-40 p-6 flex flex-col justify-between bg-white/10 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl border border-white/20 shadow-lg shadow-white/10">
        <h2 className="text-2xl font-semibold text-white text-center">
          {title}
        </h2>
        <p className="text-gray-200 text-base text-center">{text}</p>
        <button
          onClick={onClick}
          className="py-2 px-4 bg-white text-black rounded-lg shadow-md hover:bg-black hover:text-white active:bg-gray-800 active:text-white transition duration-300 font-mono"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default GlassmorphicCard;
