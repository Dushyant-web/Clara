import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react'

const OrderConfirmationPage = () => {
    return (
        <div className="pt-40 pb-24 min-h-screen bg-primary flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-2xl text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="w-24 h-24 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <CheckCircle size={48} strokeWidth={1.5} />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif tracking-tighter text-secondary mb-8">THANK YOU.</h1>

                    <div className="space-y-4 mb-16">
                        <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Order #ORD-2026-X992V</p>
                        <p className="text-lg text-secondary opacity-80 max-w-md mx-auto leading-relaxed">
                            Your premium pieces are being prepared by our artisans. A confirmation email has been sent to your inbox.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                        <Link to="/order-tracking/ORD-2026-X992V" className="p-8 border border-secondary/10 bg-secondary/5 text-left group hover:border-secondary/30 transition-all block">
                            <Truck className="text-secondary mb-4 opacity-50" size={20} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">Track Shipping</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">Follow your order's journey in real-time.</p>
                        </Link>
                        <div className="p-8 border border-secondary/10 bg-secondary/5 text-left group hover:border-secondary/30 transition-all cursor-pointer">
                            <ShoppingBag className="text-secondary mb-4 opacity-50" size={20} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">Support Hero</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">Need assistance? Our concierge is here to help.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link
                            to="/shop"
                            className="px-12 py-5 bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                            Continue Shopping <ArrowRight size={14} />
                        </Link>
                        <Link
                            to="/account"
                            className="px-12 py-5 border border-secondary text-secondary text-[10px] font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all flex items-center justify-center"
                        >
                            Order Details
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default OrderConfirmationPage
