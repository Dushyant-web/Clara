import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, addToCart, cartTotal } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-primary/80 backdrop-blur-md z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-primary border-l border-secondary/10 shadow-2xl z-[101] flex flex-col transition-colors duration-500"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-secondary/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <ShoppingBag size={20} className="text-secondary" />
                                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-secondary">Your Bag ({cartItems.length})</h2>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-secondary/5 transition-colors"
                            >
                                <X size={24} strokeWidth={1} className="text-secondary" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                                    <div className="w-16 h-16 bg-secondary/5 rounded-full flex items-center justify-center">
                                        <ShoppingBag size={24} className="text-gray-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-gray-400">Your bag is empty</p>
                                        <Link
                                            to="/shop"
                                            onClick={() => setIsCartOpen(false)}
                                            className="text-[10px] font-black border-b border-secondary pb-1 text-secondary tracking-widest block"
                                        >
                                            Explore Collection
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {cartItems.map((item) => (
                                        <div key={item.uniqueKey} className="flex gap-6 group text-secondary">
                                            <div className="w-24 aspect-[3/4] bg-secondary/5 overflow-hidden border border-secondary/10 shrink-0">
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'}
                                                    alt={item.name}
                                                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-[10px] font-black tracking-[0.1em] uppercase">{item.name}</h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.itemId || item.id, item.uniqueKey)}
                                                            className="text-gray-500 hover:text-secondary transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">
                                                        Size: {item.size || 'One Size'}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center border border-secondary/10">
                                                        <button
                                                            onClick={() => addToCart(item, item.variantId, -1)}
                                                            className="p-2 hover:text-secondary text-gray-500 transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => addToCart(item, item.variantId, 1)}
                                                            className="p-2 hover:text-secondary text-gray-500 transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <span className="text-xs font-serif font-bold italic transition-all">₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-8 space-y-8 border-t border-secondary/10 bg-secondary/5 transition-colors">
                                <div className="flex justify-between items-center text-[10px] tracking-[0.3em] font-black uppercase text-secondary">
                                    <span>Subtotal</span>
                                    <span className="text-xl font-serif">₹{cartTotal}</span>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        to="/checkout"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-secondary text-primary py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:opacity-90 transition-all group"
                                    >
                                        Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/cart"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full border border-secondary text-secondary py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:bg-secondary hover:text-primary transition-all"
                                    >
                                        View Shopping Bag
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
