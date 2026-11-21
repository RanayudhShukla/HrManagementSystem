import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingCart, Package, AlertTriangle, Plus, 
  Trash2, RefreshCw, CheckCircle2, ChevronRight, Edit3, X 
} from 'lucide-react';

export default function AdminDashboard({ onProductChanged }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'inventory'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for creating a new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Keyboards',
    price: '',
    stock: '',
    description: '',
    image: '',
    features: '',
    isFeatured: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      const statsData = await statsRes.json();
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (prodData.success) setProducts(prodData.data);
      if (ordData.success) setOrders(ordData.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle fast stock update from CMS
  const handleUpdateStock = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        fetchData();
        if (onProductChanged) onProductChanged();
      }
    } catch (err) {
      alert('Error updating stock');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product from the store?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
        if (onProductChanged) onProductChanged();
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  // Handle creating a new product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({
          name: '',
          category: 'Keyboards',
          price: '',
          stock: '',
          description: '',
          image: '',
          features: '',
          isFeatured: false,
        });
        fetchData();
        if (onProductChanged) onProductChanged();
      }
    } catch (err) {
      alert('Error creating product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-slate-400">Live API Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            ApexGear Store Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            ${stats ? stats.totalRevenue.toFixed(2) : '0.00'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>↑ Real-time from {stats?.totalOrders || 0} orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {stats ? stats.totalOrders : 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            All customer checkouts logged
          </p>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog SKUs</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {products.length} Items
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across 5 categories
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {stats ? stats.lowStockCount : 0} Items
          </p>
          <p className="text-[11px] text-amber-400/80 mt-1">
            Items with 5 or fewer in stock
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'products'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'orders'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'inventory'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Low Stock Watchlist ({stats?.lowStockCount || 0})
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white">{prod.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{prod.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      ${prod.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                            prod.stock <= 5
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                          <button
                            onClick={() => handleUpdateStock(prod.id, prod.stock, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateStock(prod.id, prod.stock, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-cyan-400">{ord.id}</span>
                      <p className="text-[11px] text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{ord.customer.fullName}</p>
                      <p className="text-[11px] text-slate-400">{ord.customer.email}</p>
                      <p className="text-[10px] text-slate-500">{ord.customer.city}, {ord.customer.country}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ${ord.total.toFixed(2)}
                      {ord.couponCode && (
                        <span className="block text-[10px] font-mono text-emerald-400">
                          Coupon: {ord.couponCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border bg-slate-950 cursor-pointer focus:outline-none ${
                          ord.status === 'Delivered'
                            ? 'text-emerald-400 border-emerald-800'
                            : ord.status === 'Shipped'
                            ? 'text-blue-400 border-blue-800'
                            : ord.status === 'Processing'
                            ? 'text-amber-400 border-amber-800'
                            : 'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOW STOCK WATCHLIST */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-2">Automated Inventory Health Alert</h3>
          <p className="text-xs text-slate-400 mb-6">
            Products flagged below threshold (stock &le; 5 units). You can quickly trigger supplier restocking here.
          </p>

          <div className="space-y-3">
            {products
              .filter((p) => p.stock <= 5)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-amber-500/20"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                      <p className="text-xs text-amber-400 font-mono">
                        Critical: Only {p.stock} units remaining in warehouse
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateStock(p.id, p.stock, 10)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                  >
                    + Restock 10 Units
                  </button>
                </div>
              ))}

            {products.filter((p) => p.stock <= 5).length === 0 && (
              <div className="text-center py-10 text-emerald-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>All product inventory levels are healthy! No low stock alerts.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Add New Product to ApexGear</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stealth CNC Aluminum Desk Riser"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Keyboards">Keyboards</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Desk Setup">Desk Setup</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Image URL (Unsplash or Direct Link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Product highlights, materials, and benefits..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Key Features (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Tri-mode wireless, CNC finish, 2-Year warranty"
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
