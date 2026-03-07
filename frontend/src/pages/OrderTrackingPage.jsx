import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Package, Truck, CheckCircle2, Circle, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react'

const OrderTrackingPage = () => {
    const { id = 'ORD-12345' } = useParams()

    const orderSteps = [
        { name: 'Order Placed', date: 'Oct 24, 2026', time: '10:30 AM', status: 'completed', icon: Package },
        { name: 'Processing', date: 'Oct 24, 2026', time: '02:45 PM', status: 'completed', icon: CheckCircle2 },
        { name: 'Shipped', date: 'Oct 25, 2026', time: '09:15 AM', status: 'current', icon: Truck },
        { name: 'Out for Delivery', date: '-', time: '-', status: 'upcoming', icon: MapPin },
        { name: 'Delivered', date: '-', time: '-', status: 'upcoming', icon: CheckCircle2 },
    ]

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div>
                        <h1 className="text-4xl font-serif tracking-tighter uppercase mb-4">Track Order</h1>
                        <p className="text-xs uppercase tracking-widest text-gray-500">ID: <span className="text-white font-bold">{id}</span></p>
                    </div>
                    <Link to="/shop" className="px-8 py-3 bg-white text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        Keep Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Tracking Timeline */}
                    <div className="md:col-span-2 space-y-12">
                        {orderSteps.map((step, idx) => (
                            <div key={idx} className="flex gap-8 relative">
                                {idx !== orderSteps.length - 1 && (
                                    <div className={`absolute left-4 top-10 w-px h-12 ${step.status === 'completed' ? 'bg-white' : 'bg-white/10'}`} />
                                )}

                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-500 z-10 ${step.status === 'upcoming' ? 'bg-primary border-white/10 text-gray-600' :
                                        step.status === 'current' ? 'bg-primary border-white text-white' : 'bg-white border-white text-primary'
                                    }`}>
                                    <step.icon size={16} />
                                </div>

                                <div className="flex-grow pt-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-xs uppercase tracking-widest font-bold ${step.status === 'upcoming' ? 'text-gray-600' : 'text-white'}`}>
                                            {step.name}
                                        </h3>
                                        {step.status === 'completed' && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                    <div className="flex gap-6 text-[10px] uppercase tracking-widest text-gray-500">
                                        <span className="flex items-center gap-2"><Calendar size={12} /> {step.date}</span>
                                        <span className="flex items-center gap-2"><Clock size={12} /> {step.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Details Card */}
                    <div className="space-y-8">
                        <div className="bg-neutral-900 border border-white/5 p-8">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-gray-200">Delivery Information</h2>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Carrier</h4>
                                    <p className="text-xs uppercase tracking-widest font-bold">DHL Express Worldwide</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Estimated Arrival</h4>
                                    <p className="text-xs uppercase tracking-widest font-bold">Oct 29, 2026</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Shipping Address</h4>
                                    <p className="text-xs uppercase tracking-[0.2em] font-bold leading-relaxed">
                                        123 Fashion Ave,<br />
                                        Lower Manhattan,<br />
                                        New York, NY 10013
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900 border border-white/5 p-8 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Package size={20} className="text-gray-400" />
                            </div>
                            <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Order Summary</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">3 Items • $745.00</p>
                            <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white hover:text-grayAccent transition-colors">Download Invoice</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderTrackingPage
