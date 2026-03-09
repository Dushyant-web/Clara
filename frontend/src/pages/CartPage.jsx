import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../hooks/useCartStore'

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity } = useCartStore()

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shipping = subtotal > 500 ? 0 : 25
    const total = subtotal + shipping

    if (cart.length === 0) {
        return (
            <div className="pt-40 pb-24 min-h-screen bg-primary flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-8 border border-white/5">
                    <ShoppingBag size={32} className="text-gray-500" />
                </div>
                <h1 className="text-4xl font-serif tracking-tighter mb-4 uppercase">Your Cart is Empty</h1>
                <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-12">Fine pieces are waiting for you in the collection.</p>
                <Link
                    to="/shop"
                    className="px-12 py-5 bg-white text-primary text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                >
                    Explore Collection
                </Link>
            </div>
        )
    }

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-16 uppercase text-secondary">Shopping Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="border-t border-white/10">
                            <AnimatePresence mode='popLayout'>
                                {cart.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.size}`}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col md:flex-row gap-8 py-10 border-b border-white/10 relative group"
                                    >
                                        <div className="w-full md:w-32 aspect-[3/4] overflow-hidden bg-neutral-900 border border-secondary/5 shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>

                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">{item.category}</span>
                                                    <h3 className="text-xl font-medium tracking-tight uppercase">{item.name}</h3>
                                                    <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">Size: <span className="text-white font-bold">{item.size}</span></p>
                                                </div>
                                                <p className="text-lg font-serif">₹{item.price}</p>
                                            </div>

                                            <div className="flex justify-between items-end mt-8">
                                                <div className="flex items-center border border-white/10">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                        className="p-3 hover:text-white text-gray-500 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-12 text-center text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        className="p-3 hover:text-white text-gray-500 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.size)}
                                                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors"
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
                                className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <ArrowRight size={14} strokeWidth={3} /> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Summary Panel */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-black p-8 border border-black/10 dark:border-white/10 sticky top-32 transition-colors duration-500 shadow-sm">
                            <h2 className="text-2xl font-serif tracking-tighter uppercase mb-8 text-black dark:text-white">Summary</h2>

                            <div className="space-y-4 mb-8 pb-8 border-b border-black/5 dark:border-white/5">
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-black dark:text-white">
                                    <span className="opacity-50">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-black dark:text-white">
                                    <span className="opacity-50">Shipping</span>
                                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">Spend ₹{(500 - subtotal).toFixed(2)} more for free delivery.</p>
                                )}
                            </div>

                            {/* Promo Code */}
                            <div className="mb-8">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="PROMO CODE"
                                        className="flex-grow bg-transparent border-b border-black/10 dark:border-white/10 py-2 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-black dark:focus:border-white transition-all text-black dark:text-white placeholder:text-gray-300"
                                    />
                                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-black dark:text-white hover:opacity-50 transition-opacity">Apply</button>
                                </div>
                            </div>

                            <div className="flex justify-between text-2xl font-serif mb-10 text-black dark:text-white">
                                <span className="uppercase tracking-tighter">Total</span>
                                <span className="font-bold">₹{total.toFixed(2)}</span>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:opacity-80 transition-all group"
                            >
                                Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-6">Accepted Payments</p>
                                <div className="flex gap-3">
                                    <div className="flex-1 border border-black/20 dark:border-white/20 py-3 flex items-center justify-center text-black dark:text-white">
                                        <span className="text-[9px] font-black tracking-widest">CARD</span>
                                    </div>
                                    <div className="flex-1 border border-black/20 dark:border-white/20 py-3 flex items-center justify-center text-black dark:text-white">
                                        <span className="text-[9px] font-black tracking-widest">UPI</span>
                                    </div>
                                    <div className="flex-1 border border-black/20 dark:border-white/20 py-3 flex items-center justify-center text-black dark:text-white">
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
