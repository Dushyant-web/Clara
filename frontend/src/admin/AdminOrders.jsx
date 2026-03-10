import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    ExternalLink,
    Filter,
    ChevronDown,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllOrders();
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Status update failed', err);
            alert('FAILED TO UPDATE STATUS.');
        }
    };

    const statusColors = {
        'pending': 'bg-amber-500/10 text-amber-500',
        'processing': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'shipped': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        'delivered': 'bg-green-500/10 text-green-500 border-green-500/20',
        'cancelled': 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter.toLowerCase());

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Order Manifest</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Monitor fulfillment, logistics, and global delivery</p>
                </div>
                <div className="flex gap-4">
                    {['All', 'Processing', 'Shipped', 'Delivered'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-3 text-[10px] uppercase tracking-widest font-black border transition-all ${filter === s ? 'bg-white text-black border-white' : 'border-white/5 text-gray-500 hover:border-white/20'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </header>

            <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Order ID</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Recipient</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Amount</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Status</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Date</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 text-right">Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-white/5">
                                    <td colSpan={6} className="p-8 h-24 bg-white/2" />
                                </tr>
                            ))
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center opacity-30 text-[10px] uppercase tracking-[0.5em] font-black">No Active Manifest Entries</td>
                            </tr>
                        ) : (
                            filteredOrders.map((o) => (
                                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 group transition-colors">
                                    <td className="p-6 font-bold text-xs">#{o.id}</td>
                                    <td className="p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{o.shipping_name || 'Guest User'}</p>
                                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">{o.email || 'No Email'}</p>
                                    </td>
                                    <td className="p-6 text-xs font-bold">₹{o.total_amount}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black border ${statusColors[o.status] || 'border-white/10'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {new Date(o.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-6 text-right">
                                        <select
                                            value={o.status}
                                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                            className="bg-black border border-white/10 p-2 text-[8px] uppercase tracking-widest font-black focus:outline-none focus:border-white transition-all cursor-pointer"
                                        >
                                            <option value="pending">PENDING</option>
                                            <option value="processing">PROCESSING</option>
                                            <option value="shipped">SHIPPED</option>
                                            <option value="delivered">DELIVERED</option>
                                            <option value="cancelled">CANCELLED</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
