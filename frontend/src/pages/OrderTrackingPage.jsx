import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Package, Truck, CheckCircle2, Circle, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react'

const OrderTrackingPage = () => {
    const { id = 'ORD-12345' } = useParams()

    const orderSteps = []

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

                {orderSteps.length > 0 ? (
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
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Awaiting carrier update...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-neutral-900 border border-white/5 p-20 text-center">
                        <Truck size={48} className="mx-auto mb-8 text-gray-800" />
                        <h2 className="text-xl font-serif uppercase tracking-widest mb-4">No Tracking Information</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                            Tracking details will appear here once your order has been dispatched by our artisans.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderTrackingPage
