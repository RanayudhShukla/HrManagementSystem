import React from 'react';
import { CheckCircle, Printer, ArrowRight, Package, Copy } from 'lucide-react';

export default function OrderSuccessModal({ order, onClose, onTrackOrder }) {
  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    alert(`Order ID ${order.id} copied to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Success Badge */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-extrabold text-white">Order Confirmed!</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Thank you, <strong className="text-white">{order.customer?.fullName}</strong>. Your workspace gear is being packed and prepared for dispatch.
        </p>

        {/* Order Reference Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Order Reference</span>
            <span className="text-base font-mono font-bold text-cyan-400">{order.id}</span>
          </div>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy ID</span>
          </button>
        </div>

        {/* Itemised Receipt Box */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left text-xs space-y-2.5">
          <div className="flex justify-between text-slate-400 font-semibold border-b border-slate-800 pb-2">
            <span>Items Ordered ({order.items?.length})</span>
            <span>Subtotal</span>
          </div>

          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-slate-300">
              <span className="truncate pr-4">
                {item.quantity}x {item.name}
              </span>
              <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-slate-800 pt-2 space-y-1 text-slate-400">
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({order.couponCode})</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-white">{order.shipping === 0 ? 'FREE' : `$${order.shipping}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
              <span>Paid Total</span>
              <span className="text-cyan-400">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Invoice Receipt</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.id);
            }}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-500/20"
          >
            <Package className="w-4 h-4" />
            <span>Track Order</span>
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
