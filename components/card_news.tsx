import React from "react";

const Card = ({ title, text, text2, image, onClick }) => {
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
        <p className="text-gray-200 text-base text-center">{text}</p>
        {text2 && (
          <p className="text-gray-200 text-base text-center">{text2}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
