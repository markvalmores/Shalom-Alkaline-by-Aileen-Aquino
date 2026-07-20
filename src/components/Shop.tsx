import React, { useState, useEffect } from 'react';
import { productsList } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, 
  MapPin, Phone, Hash, ShieldCheck, ClipboardCheck,
  Truck, ArrowRight, Package, Check, Clipboard, Clock
} from 'lucide-react';

export default function Shop() {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  // Active view: 'products', 'cart', 'orders'
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'orders'>('products');

  // Order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // For admin
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [gcashReference, setGcashReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Load User Orders
  useEffect(() => {
    if (!user) return;

    // Standard user query
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Order query error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Load All Orders (If Admin)
  useEffect(() => {
    if (!user || !user.isAdmin) return;

    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAll = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setAllOrders(fetchedAll);
    }, (error) => {
      console.error('All Orders query error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    if (!shippingAddress.trim() || !gcashReference.trim()) {
      alert('Please fill out shipping address and GCash reference number.');
      return;
    }

    // Basic GCash Reference validation: must be 13 digits
    const gcashRegex = /^\d{13}$/;
    if (!gcashRegex.test(gcashReference.trim())) {
      alert('Invalid GCash reference. Please enter exactly 13 digits.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        displayName: user.displayName,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageURL: item.product.imageURL
        })),
        totalAmount: cartTotal,
        gcashReference: gcashReference.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingZip: shippingZip.trim(),
        shippingPhone: shippingPhone.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderSuccess(docRef.id);
      clearCart();
      
      // Reset form
      setShippingAddress('');
      setShippingCity('');
      setShippingZip('');
      setShippingPhone('');
      setGcashReference('');
      
      // Switch tab
      setActiveTab('orders');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!user?.isAdmin) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Tab Selector */}
      <div className="flex border-b border-tea-green/30 mb-8 gap-4">
        <button
          onClick={() => { setActiveTab('products'); setOrderSuccess(null); }}
          className={`pb-4 px-2 text-lg font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'products' 
              ? 'border-violet-primary text-violet-deep' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" /> Products
        </button>
        <button
          onClick={() => { setActiveTab('cart'); setOrderSuccess(null); }}
          className={`pb-4 px-2 text-lg font-bold border-b-2 transition-all flex items-center gap-2 relative ${
            activeTab === 'cart' 
              ? 'border-violet-primary text-violet-deep' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-3 bg-violet-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('orders'); setOrderSuccess(null); }}
          className={`pb-4 px-2 text-lg font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders' 
              ? 'border-violet-primary text-violet-deep' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-5 h-5" /> Orders
          {orders.length > 0 && (
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* PRODUCTS VIEW */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {productsList.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-3xl border border-tea-green/30 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group h-full"
              >
                <div className="h-56 overflow-hidden relative bg-slate-100">
                  <img 
                    src={product.imageURL} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-violet-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.pH}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-violet-deep mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">{product.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mb-6">
                      <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">Capacity: {product.capacity}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-2xl font-black text-violet-deep">₱{product.price.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          addToCart(product);
                          // Provide nice feedback or go to cart
                          alert(`${product.name} added to cart!`);
                        }}
                        className="bg-violet-primary hover:bg-violet-deep text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* CART VIEW */}
        {activeTab === 'cart' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-tea-green/20">
                  <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold mb-4">Your cart is currently empty.</p>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="bg-violet-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-violet-deep transition-all"
                  >
                    Browse Premium Water Purifiers
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="bg-white rounded-3xl border border-tea-green/30 p-6 flex items-center gap-6"
                  >
                    <img 
                      src={item.product.imageURL} 
                      alt="" 
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-slate-100"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-violet-deep text-lg">{item.product.name}</h4>
                      <p className="text-slate-400 text-sm font-semibold">₱{item.product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-slate-700 w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Portal */}
            {cart.length > 0 && (
              <div className="bg-white rounded-3xl border border-tea-green/30 p-6 shadow-sm h-fit">
                <h3 className="font-bold text-violet-deep text-xl mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <ClipboardCheck className="w-5 h-5 text-violet-primary" /> Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Items Total</span>
                    <span>₱{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-violet-deep pt-3 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span>₱{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* GCash Details Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Step 1: GCash Payment Required</p>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Send exactly <span className="font-bold">₱{cartTotal.toLocaleString()}</span> to GCash:
                  </p>
                  <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-blue-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">GCASH PHONE NUMBER</p>
                      <p className="font-mono font-bold text-violet-deep">09974268658</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('09974268658');
                        alert('GCash number copied!');
                      }}
                      className="p-2 hover:bg-slate-100 text-blue-600 rounded-lg"
                      title="Copy Number"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckout} className="space-y-4">
                  <p className="text-xs font-bold text-violet-primary uppercase tracking-wider">Step 2: Shipping & Reference Details</p>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">GCash Reference Number</label>
                    <input 
                      type="text"
                      required
                      placeholder="Paste 13-digit Reference Code"
                      value={gcashReference}
                      onChange={(e) => setGcashReference(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Shipping Street Address</label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="House No, Street, Brgy"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">City</label>
                      <input 
                        type="text"
                        required
                        placeholder="City"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Zip Code</label>
                      <input 
                        type="text"
                        required
                        placeholder="Zip"
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pb-4">
                    <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                    <input 
                      type="tel"
                      required
                      placeholder="09XXXXXXXXX"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-primary/20 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-violet-primary hover:bg-violet-deep text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-primary/10 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming Order...' : <><ShieldCheck className="w-5 h-5" /> Submit GCash Payment</>}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* ORDERS VIEW */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* User Personal Orders Section */}
            <div>
              <h2 className="text-2xl font-bold text-violet-deep mb-6 flex items-center gap-2">
                <Truck className="w-6 h-6 text-violet-primary" /> My Order Portal
              </h2>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-tea-green/20 max-w-2xl">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">You have not placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white rounded-3xl border border-tea-green/30 p-6 shadow-sm hover:border-violet-primary/20 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-50 mb-4">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order Reference</p>
                          <p className="text-sm font-mono font-bold text-violet-deep">#{order.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mb-6">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 text-sm">
                            <img src={item.imageURL} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-50" />
                            <div className="flex-1">
                              <p className="font-bold text-slate-700">{item.name}</p>
                              <p className="text-xs text-slate-400">Qty: {item.quantity} × ₱{item.price.toLocaleString()}</p>
                            </div>
                            <span className="font-semibold text-slate-700">₱{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
                        <div>
                          <p className="font-bold text-violet-deep mb-2">SHIPPING ADDRESS</p>
                          <p>{order.shippingAddress}</p>
                          <p>{order.shippingCity}, {order.shippingZip}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-violet-deep">PAYMENT DETAILS</p>
                          <p>GCash Reference: <span className="font-mono font-bold">{order.gcashReference}</span></p>
                          <p>Contact Phone: <span className="font-mono">{order.shippingPhone}</span></p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-50">
                        <span className="text-sm font-bold text-slate-400">Total Paid</span>
                        <span className="text-lg font-extrabold text-violet-deep">₱{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Management Panel (If Admin User) */}
            {user?.isAdmin && (
              <div className="border-t-2 border-dashed border-tea-green/40 pt-8 mt-12">
                <div className="bg-violet-deep text-white p-6 rounded-[2.5rem] mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-tea-green" /> Admin Shipping & Order Control
                  </h3>
                  <p className="text-xs text-violet-soft mt-1">
                    System portal for {user?.email} to fulfill client shipments and verify reference codes.
                  </p>
                </div>

                {allOrders.length === 0 ? (
                  <p className="text-slate-400 text-sm">No incoming store orders found.</p>
                ) : (
                  <div className="space-y-6">
                    {allOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
                          <div>
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full uppercase">Client Order</span>
                            <p className="text-sm font-bold text-slate-800 mt-1">Client: {order.displayName} ({order.userEmail})</p>
                            <p className="text-xs text-slate-400 font-mono">ID: #{order.id}</p>
                          </div>
                          
                          {/* Status action buttons */}
                          <div className="flex flex-wrap gap-2">
                            {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(order.id, st)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                                  order.status === st
                                    ? 'bg-violet-primary text-white scale-105'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-2 mb-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-sm flex justify-between text-slate-600">
                              <span>{item.name} (Qty: {item.quantity})</span>
                              <span className="font-bold">₱{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* GCash Verification */}
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-yellow-800">GCASH REFERENCE CODE TO VERIFY:</p>
                          <p className="font-mono text-sm font-extrabold text-violet-deep select-all">{order.gcashReference}</p>
                          <p className="text-slate-500">Shipping Phone: {order.shippingPhone}</p>
                          <p className="text-slate-500">Address: {order.shippingAddress}, {order.shippingCity}, {order.shippingZip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
