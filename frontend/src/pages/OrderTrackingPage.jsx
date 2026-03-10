import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, ChevronLeft, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';

const OrderTrackingPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await orderService.getOrder(id);
                // Enhance status with real-time payment check if it's not already delivered
                if (data.status !== 'delivered') {
                    try {
                        const paymentStatus = await orderService.getPaymentStatus(id);
                        if (paymentStatus.status === 'captured' || paymentStatus.status === 'confirmed') {
                            data.status = 'confirmed';
                        }
                    } catch (e) {
                        console.warn('Real-time payment status check failed, using order data status.');
                    }
                }
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleDownloadInvoice = async () => {
        try {
            const blob = await orderService.getInvoice(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Failed to download invoice', error);
            alert('Could not generate invoice at this time.');
        }
    };

    if (loading) return <div className="h-screen bg-primary flex items-center justify-center p-20 text-[10px] tracking-[0.5em] animate-pulse uppercase text-secondary">Searching...</div>;

    if (!order) return (
        <div className="h-screen bg-primary flex items-center justify-center p-20 text-center flex-col space-y-8 text-secondary">
            <h2 className="text-2xl font-serif uppercase tracking-widest">Order not found</h2>
            <Link to="/account" className="px-12 py-5 bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all font-bold">BACK TO ACCOUNT</Link>
        </div>
    );

    const statuses = [
        { id: 'placed', name: 'ORDER PLACED', icon: Package, done: true, date: new Date(order.created_at).toLocaleDateString(), time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: 'confirmed', name: 'PAYMENT CONFIRMED', icon: CheckCircle2, done: order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered', date: new Date(order.created_at).toLocaleDateString(), time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: 'shipped', name: 'OUT FOR DELIVERY', icon: Truck, done: order.status === 'shipped' || order.status === 'delivered', date: '-- / -- / --', time: '--:--' },
        { id: 'delivered', name: 'DELIVERED', icon: CheckCircle2, done: order.status === 'delivered', date: '-- / -- / --', time: '--:--' },
    ];

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-4xl text-secondary">
                <header className="mb-16 space-y-6">
                    <Link to="/account" className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-gray-500 hover:text-secondary transition-colors uppercase">
                        <ArrowLeft size={14} />
                        <span>BACK TO ACCOUNT</span>
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <p className="text-[10px] tracking-[0.5em] font-bold opacity-30 mb-2 uppercase">TRACKING STATUS</p>
                            <h1 className="text-4xl font-serif tracking-tighter uppercase">Order #{id}</h1>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-bold opacity-30 uppercase mb-1">CURRENT STATUS</p>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-secondary border-b border-secondary/20 pb-1">{order.status}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Tracking Timeline */}
                    <div className="lg:col-span-8 space-y-12">
                        {statuses.map((status, idx) => (
                            <div key={idx} className={`flex gap-8 relative ${status.done ? 'opacity-100' : 'opacity-30'}`}>
                                {idx !== statuses.length - 1 && (
                                    <div className={`absolute left-4 top-10 w-px h-12 ${status.done ? 'bg-secondary' : 'bg-secondary/10'}`} />
                                )}

                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-500 z-10 ${!status.done ? 'bg-primary border-secondary/10 text-gray-600' :
                                    'bg-secondary border-secondary text-primary'
                                    }`}>
                                    <status.icon size={16} />
                                </div>

                                <div className="flex-grow pt-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-xs uppercase tracking-widest font-bold ${!status.done ? 'text-gray-600' : 'text-secondary'}`}>
                                            {status.name}
                                        </h3>
                                        {status.done && <CheckCircle2 size={14} className="text-secondary" />}
                                    </div>
                                    <div className="flex gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                        <span className="flex items-center gap-2"><Calendar size={12} /> {status.date}</span>
                                        <span className="flex items-center gap-2"><Clock size={12} /> {status.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Info Card */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <section className="bg-secondary/5 border border-secondary/10 p-8 shadow-sm">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-secondary">Delivery Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold opacity-30 uppercase mb-2 tracking-widest">Shipping Address</p>
                                    <div className="flex gap-3 text-secondary/70">
                                        <MapPin size={14} className="shrink-0 mt-1" />
                                        <p className="text-xs leading-relaxed uppercase tracking-widest font-bold">{order.shipping_address || 'Address awaiting carrier confirmation...'}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-secondary/10">
                                    <p className="text-[10px] font-bold opacity-30 uppercase mb-2 tracking-widest">Order Total</p>
                                    <p className="text-xl font-serif">₹{order.total_amount}</p>
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handleDownloadInvoice}
                            className="w-full py-5 border border-secondary text-secondary text-[10px] font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all mb-4"
                        >
                            Download Invoice
                        </button>
                        <button className="w-full py-5 border border-secondary/10 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all">
                            Contact Concierge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
