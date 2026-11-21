import React from 'react';
import { Star, ShoppingBag, Eye, AlertCircle } from 'lucide-react';

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
}) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-md bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-700/60">
          {product.category}
        </span>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-rose-500/90 text-white shadow-sm flex items-center gap-1">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-500/90 text-slate-950 shadow-sm flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            Only {product.stock} left!
          </span>
        ) : null}

        {/* Quick View Button (hover overlay) */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-cyan-500 hover:text-slate-950"
          title="Quick View Details"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-5">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 font-semibold text-slate-200">{product.rating}</span>
          </div>
          <span>•</span>
          <span>{product.reviewsCount} reviews</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onQuickView(product)}
          className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Add to Cart button */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500 block">Price</span>
            <span className="text-lg font-bold text-white tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
