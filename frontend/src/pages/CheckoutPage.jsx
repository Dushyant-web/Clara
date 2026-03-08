import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Check, MapPin, Truck, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '../hooks/useCartStore'

const CheckoutPage = () => {
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'upi'
    const { cart, clearCart } = useCartStore()
    const navigate = useNavigate()

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const total = subtotal > 500 ? subtotal : subtotal + 25

    const steps = [
        { id: 1, name: 'Shipping', icon: MapPin },
        { id: 2, name: 'Delivery', icon: Truck },
        { id: 3, name: 'Payment', icon: CreditCard },
    ]

    const nextStep = () => {
        if (step < 3) setStep(step + 1)
        else {
            // Finalize order
            clearCart()
            navigate('/order-confirmation')
        }
    }

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen text-secondary">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Flow */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-12">
                            <h1 className="text-4xl font-serif tracking-tighter text-secondary">Checkout</h1>
                            <Link to="/cart" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2">
                                <ArrowLeft size={14} /> Back to Bag
                            </Link>
                        </div>

                        {/* Step Progress */}
                        <div className="flex justify-between mb-16 relative">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -z-10" />
                            {steps.map((s) => (
                                <div key={s.id} className="flex flex-col items-center gap-4 bg-primary px-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${step >= s.id ? 'bg-white text-primary border-white' : 'bg-primary border-white/20'
                                        }`}>
                                        {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                                    </div>
                                    <span className={`text-[10px] tracking-widest font-bold ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>
                                        {s.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                {step === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] tracking-widest text-gray-500 mb-2 block font-bold">Shipping Country</label>
                                            <input type="text" value="India" disabled className="w-full bg-neutral-900 border-b border-white/20 py-4 text-xs font-bold focus:outline-none cursor-not-allowed opacity-50" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] tracking-widest text-gray-500 mb-2 block font-bold uppercase">Address Auto-fill (AI Powered)</label>
                                            <input type="text" placeholder="Start typing your address..." className="w-full bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all" />
                                        </div>
                                        <input type="email" placeholder="Email Address" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all" />
                                        <div className="relative border-b border-white/20 focus-within:border-white transition-all">
                                            <span className="absolute left-0 bottom-4 text-xs font-bold">+91</span>
                                            <input type="tel" placeholder="Phone Number" className="w-full bg-transparent pl-8 py-4 text-xs font-bold focus:outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <input type="text" placeholder="City" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all" />
                                            <input type="text" placeholder="State" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all" />
                                        </div>
                                        <input type="text" placeholder="Pincode" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all" />
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <label className="bg-neutral-900 border border-white/10 p-6 flex justify-between items-center cursor-pointer hover:border-white transition-all">
                                            <div className="flex items-center gap-6">
                                                <Truck size={24} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold">Express Global</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">3-5 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold font-sans">$25.00</span>
                                            <input type="radio" name="delivery" defaultChecked className="hidden" />
                                        </label>
                                        <label className="bg-neutral-900 border border-white/10 p-6 flex justify-between items-center cursor-pointer hover:border-white transition-all opacity-50">
                                            <div className="flex items-center gap-6">
                                                <Truck size={24} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold">Standard Economy</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">7-14 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold font-sans">FREE</span>
                                            <input type="radio" name="delivery" className="hidden" />
                                        </label>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`p-6 border flex flex-col items-center gap-4 transition-all duration-300 ${paymentMethod === 'card' ? 'bg-white text-primary border-white' : 'border-white/10 hover:border-white'}`}
                                            >
                                                <CreditCard size={24} />
                                                <span className="text-[10px] font-bold">Credit/Debit Card</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('upi')}
                                                className={`p-6 border flex flex-col items-center gap-4 transition-all duration-300 ${paymentMethod === 'upi' ? 'bg-white text-primary border-white' : 'border-white/10 hover:border-white'}`}
                                            >
                                                <ShoppingBag size={24} />
                                                <span className="text-[10px] font-bold">Razorpay / UPI</span>
                                            </button>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {paymentMethod === 'card' ? (
                                                <motion.div
                                                    key="card-fields"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4 pt-6"
                                                >
                                                    <input type="text" placeholder="Card Number" className="w-full bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all text-secondary" />
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <input type="text" placeholder="Expiry (MM/YY)" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all text-secondary" />
                                                        <input type="text" placeholder="CVV" className="bg-transparent border-b border-white/20 py-4 text-xs font-bold focus:outline-none focus:border-white transition-all text-secondary" />
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="upi-message"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="pt-12 pb-6 text-center"
                                                >
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <ShoppingBag className="text-gray-400" size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold tracking-widest text-secondary">Pay via Razorpay Secure</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">UPI, Netbanking, & Wallets supported</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={nextStep}
                            className="w-full mt-16 bg-white text-primary py-5 text-xs font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                        >
                            {step === 3 ? 'Place Order' : 'Continue to ' + steps[step].name} <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-neutral-900 border border-white/5 p-8 sticky top-32">
                            <h2 className="text-xl font-serif tracking-tighter mb-8 pb-8 border-b border-white/10">Order Summary</h2>
                            <div className="space-y-4 mb-8">
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.size}`} className="flex justify-between text-[10px] tracking-widest transition-all">
                                        <span className="text-gray-400 font-sans">{item.name} x {item.quantity}</span>
                                        <span className="font-sans">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4 pt-8 border-t border-white/10 mb-8">
                                <div className="flex justify-between text-[10px] tracking-widest text-gray-400 font-sans transition-all">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] tracking-widest text-gray-400 font-sans transition-all">
                                    <span>Shipping</span>
                                    <span>{subtotal > 500 ? 'FREE' : '$25.00'}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-lg font-sans transition-all">
                                <span className="tracking-widest">Total</span>
                                <span className="font-bold">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
