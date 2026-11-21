import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Clock, Truck, Home, Package } from 'lucide-react';

export default function OrderTrackingModal({
  isOpen,
  onClose,
  initialOrderId = '',
}) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const fetchOrder = async (idToFind) => {
    const id = idToFind || orderId;
    if (!id.trim()) return;

    setLoading(true);
    setError('');
    setSearchedOrder(null);

    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(
          (o) => o.id.toLowerCase() === id.trim().toLowerCase()
        );
        if (found) {
          setSearchedOrder(found);
        } else {
          setError(`No order found matching "${id}". Check the ID and try again.`);
        }
      } else {
        setError('Could not retrieve orders');
      }
    } catch (err) {
      setError('Network error while searching for order.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Order Placed', status: 'Pending', icon: Clock },
    { label: 'Packaging', status: 'Processing', icon: Package },
    { label: 'Out for Delivery', status: 'Shipped', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: Home },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 1;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Package className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Track Order Status</h2>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrder();
          }}
          className="flex gap-2 mb-6"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. ORD-98214"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {searchedOrder && (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Order ID</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{searchedOrder.id}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {searchedOrder.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
              <div 
                className="absolute top-1/2 left-8 -translate-y-1/2 h-0.5 bg-cyan-400 z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 80}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const IconComponent = step.icon;

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      } ${isCurrent ? 'ring-4 ring-cyan-500/20' : ''}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] mt-2 font-medium text-center ${
                        isCompleted ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recipient & Destination Details */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
              <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5">
                Shipping Destination
              </div>
              <p className="text-slate-400">
                <strong className="text-white">{searchedOrder.customer.fullName}</strong><br />
                {searchedOrder.customer.address}, {searchedOrder.customer.city} {searchedOrder.customer.postalCode}<br />
                {searchedOrder.customer.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
