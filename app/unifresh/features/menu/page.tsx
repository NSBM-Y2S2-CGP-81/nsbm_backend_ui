"use client";
import React, { useState } from 'react';
import Navbar from "@/components/navbar";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface MenuProps {
  menu?: MenuItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const MenuSection: React.FC<MenuProps> = ({ menu = [], onEdit, onDelete }) => {
  const dummyMenu: MenuItem[] = [
    { id: 1, name: "Cheese Burger", price: 599, description: "A juicy cheese burger with fresh lettuce and tomatoes.", imageUrl: "/assets/images/logo.png" },
    { id: 2, name: "Veggie Wrap", price: 405, description: "A healthy wrap filled with fresh veggies and hummus.", imageUrl: "/images/veggie-wrap.jpg" },
    { id: 3, name: "Chicken Sandwich", price: 649, description: "A tender chicken fillet with lettuce and mayo.", imageUrl: "/images/chicken-sandwich.jpg" },
    { id: 4, name: "Fries", price: 699, description: "Crispy and golden fries, perfect as a side.", imageUrl: "/images/fries.jpg" },
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(menu.length > 0 ? menu : dummyMenu);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<MenuItem>({
    id: menuItems.length + 1,
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    const updatedMenu = [...menuItems, { ...newItem, id: menuItems.length + 1 }];
    setMenuItems(updatedMenu);
    setNewItem({ id: updatedMenu.length + 1, name: '', price: 0, description: '', imageUrl: '' });
    setImagePreview(null); // Reset image preview
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewItem({ id: menuItems.length + 1, name: '', price: 0, description: '', imageUrl: '' });
    setImagePreview(null); // Reset image preview
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // Create an object URL to preview the image
      setNewItem({ ...newItem, imageUrl: file.name }); // You can modify this to store the image in a server
    }
  };

  return (
    <div className="space-y-6 bg-[#0A0D14] text-white shadow-lg rounded-lg p-8">
      <Navbar name="Uni Fresh: Menu [Vendor]" />

      {/* Spacer below navbar */}
      <div className="h-20" />

      {/* Add Item Button positioned to the right */}
      {!showAddForm && (
        <div className="text-right">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Add New Item
          </button>
        </div>
      )}

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="mt-6 space-y-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="p-2 border rounded-md w-full text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            placeholder="Price (LKR)"
            value={newItem.price.toString()}
            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
            className="p-2 border rounded-md w-full text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="p-2 border rounded-md w-full text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {/* Image Upload Input */}
          <div>
            <input
              type="file"
              onChange={handleImageUpload}
              className="p-2 border rounded-md w-full text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
          </div>

          {/* Button Container (Horizontal Layout) */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Confirm
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex flex-wrap justify-center gap-6 mt-10">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#1A202C] shadow-lg rounded-lg p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300 max-w-xs"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md mb-4"
              />
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                <p className="text-gray-400">LKR {item.price.toFixed(2)}</p> {/* Display price in LKR */}
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
              <div className="space-x-3 mt-4">
                <button
                  onClick={() => onEdit(item.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No menu items available.</p>
        )}
      </div>
    </div>
  );
};

export default MenuSection;
