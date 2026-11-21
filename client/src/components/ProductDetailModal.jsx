import React, { useState } from 'react';
import { X, Star, ShoppingBag, CheckCircle, Truck, ShieldCheck, Box } from 'lucide-react';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = product.stock;

  const handleIncrement = () => {
    if (quantity < maxAvailable) setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-square md:aspect-auto h-full bg-slate-950 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[360px] w-full object-cover rounded-2xl shadow-lg"
            />
            <span className="absolute top-6 left-6 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {product.category}
            </span>
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-white">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewsCount} verified reviews</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                {product.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-cyan-400">
                ${product.price.toFixed(2)}
              </p>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Feature Checklist */}
              {product.features && product.features.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highlights</p>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stock Indicator */}
              <div className="mt-5 flex items-center gap-2 text-xs">
                <Box className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Inventory Status:</span>
                {isOutOfStock ? (
                  <span className="font-bold text-rose-400">Out of Stock</span>
                ) : (
                  <span className="font-semibold text-emerald-400">
                    In Stock ({product.stock} units available)
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-4">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 p-1">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-semibold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= maxAvailable || isOutOfStock}
                    className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    isOutOfStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-98'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity > 1 ? `(${quantity}) Items` : ''} to Cart</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" /> Fast dispatch within 24h
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 30-Day Money Back Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
