"use client";
import React, { useState } from 'react';
import Navbar from "@/components/navbar";

interface Order {
  id: number;
  customer: string;
  items: string[];
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  declineReason?: string;
}

const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      customer: 'John Doe',
      items: ['Cheese Burger', 'Fries'],
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      total: 1205,
    },
    {
      id: 2,
      customer: 'Jane Smith',
      items: ['Veggie Wrap', 'Soda'],
      status: 'Accepted',
      paymentStatus: 'Paid',
      paymentMethod: 'Bank',
      total: 999,
    },
    {
      id: 3,
      customer: 'Mary Johnson',
      items: ['Chicken Sandwich', 'Fries', 'Iced Tea'],
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      total: 1575,
    },
  ]);

  const [complainOrderId, setComplainOrderId] = useState<number | null>(null);
  const [complainText, setComplainText] = useState('');
  const [declineReasonModal, setDeclineReasonModal] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');

  const handleAccept = (orderId: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Preparing' } : o));
  };

  const handleDecline = (orderId: number) => {
    setDeclineReasonModal(orderId);
  };

  const handleDeclineSubmit = () => {
    setOrders(prev =>
      prev.map(o =>
        o.id === declineReasonModal
          ? { ...o, status: 'Declined', declineReason: declineReason }
          : o
      )
    );
    setDeclineReasonModal(null);
    setDeclineReason('');
  };

  const handlePrepared = (orderId: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Ready to be Delivered' } : o));
  };

  const handlePaymentReceive = (orderId: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
  };

  const handleComplain = (orderId: number) => {
    setComplainOrderId(orderId);
  };

  const handleSubmitComplaint = () => {
    console.log(`Complaint for Order ${complainOrderId}:`, complainText);
    setComplainOrderId(null);
    setComplainText('');
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-6">
      <Navbar name="Uni Fresh: Orders [Vendor]" />
      <div className="space-y-6 mt-24">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-[#1A202C] rounded-xl shadow-md p-6 flex flex-col md:flex-row md:justify-between md:items-center transition-transform hover:scale-[1.02]"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Order ID: #{order.id}</h2>
              <p className="text-sm text-gray-300"><strong>Customer:</strong> {order.customer}</p>
              <p className="text-sm text-gray-300"><strong>Items:</strong> {order.items.join(', ')}</p>
              <p className="text-sm text-gray-300"><strong>Payment Method:</strong> {order.paymentMethod}</p>
              {order.declineReason && (
                <p className="text-sm text-red-500"><strong>Declined Reason:</strong> {order.declineReason}</p>
              )}
            </div>
            <div className="space-y-2 text-right mt-4 md:mt-0">
              <p className={`font-semibold ${order.status === 'Completed' ? 'text-green-500' : order.status === 'Declined' ? 'text-red-500' : 'text-yellow-500'}`}>
                {order.status}
              </p>
              <p className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                Payment Status: {order.paymentStatus}
              </p>
              <p><strong>Total:</strong> LKR {order.total.toFixed(2)}</p> {/* Display price in LKR */}
              
              {/* Action Buttons */}
              {order.status === 'Pending' && (
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => handleAccept(order.id)} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                    Accept
                  </button>
                  <button onClick={() => handleDecline(order.id)} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
                    Decline
                  </button>
                </div>
              )}
              {order.status === 'Preparing' && (
                <div className="flex justify-end mt-2">
                  <button onClick={() => handlePrepared(order.id)} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                    Prepared
                  </button>
                </div>
              )}
              {order.status === 'Ready to be Delivered' && order.paymentStatus === 'Pending' && order.paymentMethod === 'Cash' && (
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => handlePaymentReceive(order.id)} className="px-4 py-2 bg-yellow-600 text-black rounded hover:bg-yellow-700">
                    Received Payment
                  </button>
                  <button onClick={() => handleComplain(order.id)} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
                    File Complaint
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Decline Reason Modal */}
      {declineReasonModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Select a Reason for Declining</h3>
            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full border p-2 rounded h-12"
            >
              <option value="">Select a reason</option>
              <option value="Too Many Orders">Too Many Orders</option>
              <option value="Closing Time">Closing Time</option>
              <option value="Other">Other</option>
            </select>
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => {
                  setDeclineReasonModal(null);
                  setDeclineReason('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Modal (Floating Form) */}
      {complainOrderId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">File a Complaint</h3>
            <textarea
              value={complainText}
              onChange={(e) => setComplainText(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border p-2 rounded h-24 resize-none"
            />
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => {
                  setComplainOrderId(null);
                  setComplainText('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComplaint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
