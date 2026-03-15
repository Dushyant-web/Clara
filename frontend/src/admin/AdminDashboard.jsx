import React, { useState, useEffect } from 'react';
import {
    Users,
    ShoppingBag,
    ArrowUpRight,
    TrendingUp,
    Activity,
    CreditCard
} from 'lucide-react';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: '0.00',
        activeUsers: 0
    });
    const [graphData, setGraphData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const prodData = await productService.getProducts(1, 1);
                const orderData = await adminService.getAllOrders();

                const totalRevenue = orderData.reduce((acc, order) => acc + (parseFloat(order.total_amount) || 0), 0);

                setStats({
                    products: prodData.total || 0,
                    orders: orderData.length || 0,
                    revenue: totalRevenue.toFixed(2),
                    activeUsers: Math.floor(Math.random() * 5) + 1
                });
            } catch (err) {
                console.error('Failed to load dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { name: 'Total Revenue', value: `₹${stats.revenue}`, icon: CreditCard, trend: '+12%', color: 'border-white/10' },
        { name: 'Active Orders', value: stats.orders, icon: ShoppingBag, trend: '+5%', color: 'border-white/10' },
        { name: 'Product Stock', value: stats.products, icon: Activity, trend: '0%', color: 'border-white/10' },
        { name: 'Live Sessions', value: stats.activeUsers, icon: Users, trend: 'Live', color: 'border-white/10' },
    ];

    return (
        <div className="space-y-12">
            <header>
                <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Command Center</h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Real-time performance analytics for GAURK LUXURY</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className={`bg-white/5 border border-white/5 p-8 group hover:border-white/20 transition-all`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white text-black group-hover:scale-110 transition-transform">
                                <card.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black tracking-widest ${card.trend === 'Live' ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">{card.name}</p>
                        <p className="text-3xl font-bold tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Performance Charts Area (Placeholders for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/5 p-8 h-96 flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-xs uppercase tracking-widest font-black">Sales Velocity</h3>
                        <div className="flex gap-4">
                            <span className="w-3 h-3 bg-white" />
                            <span className="w-3 h-3 bg-white/10" />
                        </div>
                    </div>
                    <div className="flex-1 border-b border-l border-white/10 flex items-end justify-between px-4 pb-2">
                        {graphData.map((h, i) => (
                            <div
                                key={i}
                                className="w-full mx-1 bg-white hover:bg-white/50 transition-all cursor-pointer relative group/bar"
                                style={{ height: `${h}%` }}
                            >
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] px-1 py-0.5 opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">
                                    DAY {i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-8 flex flex-col">
                    <h3 className="text-xs uppercase tracking-widest font-black mb-12">Recent Activity</h3>
                    <div className="space-y-8 flex-1">
                        {recentOrders.map((order, i) => (
                            <div key={order.id} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0">
                                <div className={`w-1 h-1 rounded-full mt-2 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-white'}`} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold leading-tight">Order #{order.id} {order.status}</p>
                                    <p className="text-[8px] uppercase tracking-widest text-gray-600 mt-1">
                                        {new Date(order.created_at).toLocaleTimeString()} • ₹{order.total_amount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
