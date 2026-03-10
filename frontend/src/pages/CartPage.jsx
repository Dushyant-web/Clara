import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

const CartPage = () => {
    const { cartItems, removeFromCart, addToCart, cartTotal } = useCart()

    const subtotal = cartTotal
    const shipping = subtotal > 500 ? 0 : 25
    const total = subtotal + shipping

    if (cartItems.length === 0) {
        return (
            <div className="pt-40 pb-24 min-h-screen bg-primary flex flex-col items-center justify-center text-center px-6 transition-colors duration-500">
                <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-8 border border-secondary/10">
                    <ShoppingBag size={32} className="text-gray-500" />
                </div>
                <h1 className="text-4xl font-serif tracking-tighter mb-4 uppercase text-secondary">Your Cart is Empty</h1>
                <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-12 font-bold">Fine pieces are waiting for you in the collection.</p>
                <Link
                    to="/shop"
                    className="px-12 py-5 bg-secondary text-primary text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                >
                    Explore Collection
                </Link>
            </div>
        )
    }

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-16 uppercase text-secondary">Shopping Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="border-t border-secondary/10">
                            <AnimatePresence mode='popLayout'>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.uniqueKey}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col md:flex-row gap-8 py-10 border-b border-secondary/10 relative group text-secondary"
                                    >
                                        <div className="w-full md:w-32 aspect-[3/4] overflow-hidden bg-secondary/5 border border-secondary/10 shrink-0">
                                            <img
                                                src={item.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        </div>

                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block font-bold">{item.category}</span>
                                                    <h3 className="text-xl font-medium tracking-tight uppercase">{item.name}</h3>
                                                    {item.size && (
                                                        <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">Size: <span className="text-secondary font-bold">{item.size}</span></p>
                                                    )}
                                                </div>
                                                <p className="text-lg font-serif font-bold">₹{item.price}</p>
                                            </div>

                                            <div className="flex justify-between items-end mt-8">
                                                <div className="flex items-center border border-secondary/10">
                                                    <button
                                                        onClick={() => addToCart(item, item.variantId, -1)}
                                                        className="p-3 hover:text-secondary text-gray-500 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-12 text-center text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item, item.variantId, 1)}
                                                        className="p-3 hover:text-secondary text-gray-500 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.itemId || item.id, item.uniqueKey)}
                                                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-secondary transition-colors"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-12">
                            <Link
                                to="/shop"
                                className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-secondary transition-colors flex items-center gap-2"
                            >
                                <ArrowRight size={14} strokeWidth={3} /> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Summary Panel */}
                    <div className="lg:col-span-4">
                        <div className="bg-secondary/5 p-8 border border-secondary/10 sticky top-32 transition-all duration-500 shadow-sm text-secondary">
                            <h2 className="text-2xl font-serif tracking-tighter uppercase mb-8">Summary</h2>

                            <div className="space-y-4 mb-8 pb-8 border-b border-secondary/10">
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em]">
                                    <span className="opacity-50 font-bold">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em]">
                                    <span className="opacity-50 font-bold">Shipping</span>
                                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed font-bold">Spend ₹{(500 - subtotal).toFixed(2)} more for free delivery.</p>
                                )}
                            </div>

                            {/* Promo Code */}
                            <div className="mb-8">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="PROMO CODE"
                                        className="flex-grow bg-transparent border-b border-secondary/10 py-2 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-secondary transition-all text-secondary placeholder:text-gray-500"
                                    />
                                    <button className="text-[9px] font-black uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Apply</button>
                                </div>
                            </div>

                            <div className="flex justify-between text-2xl font-serif mb-10">
                                <span className="uppercase tracking-tighter">Total</span>
                                <span className="font-bold">₹{total.toFixed(2)}</span>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-secondary text-primary py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:opacity-80 transition-all group"
                            >
                                Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="mt-8 pt-8 border-t border-secondary/10">
                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-6">Accepted Payments</p>
                                <div className="flex gap-3">
                                    <div className="flex-1 border border-secondary/20 py-3 flex items-center justify-center">
                                        <span className="text-[9px] font-black tracking-widest">CARD</span>
                                    </div>
                                    <div className="flex-1 border border-secondary/20 py-3 flex items-center justify-center">
                                        <span className="text-[9px] font-black tracking-widest">UPI</span>
                                    </div>
                                    <div className="flex-1 border border-secondary/20 py-3 flex items-center justify-center">
                                        <span className="text-[9px] font-black tracking-widest">COD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
