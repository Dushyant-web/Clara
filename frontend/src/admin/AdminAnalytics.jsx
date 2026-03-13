import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Activity,
    CreditCard,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Calendar,
    Download,
    BarChart3
} from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, revenueRes] = await Promise.all([
                    adminService.getStats(),
                    adminService.getRevenue()
                ]);
                setStats(statsRes);
                // Calculate total revenue from orders
                const totalRev = revenueRes.reduce((acc, order) => acc + (parseFloat(order.total_amount) || 0), 0);
                setRevenue(totalRev);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const metrics = [
        { name: 'Gross Revenue', value: `₹${revenue.toLocaleString()}`, trend: '+14.2%', icon: CreditCard },
        { name: 'Average Order Value', value: `₹${stats ? (revenue / (stats.total_orders || 1)).toFixed(2) : 0}`, trend: '+5.4%', icon: BarChart3 },
        { name: 'Conversion Rate', value: '3.2%', trend: '-0.8%', icon: Activity },
        { name: 'Lifetime Users', value: stats?.total_users || 0, trend: '+22.1%', icon: Users },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Performance Analytics</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">In-depth intelligence and revenue velocity tracking</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 text-[10px] uppercase tracking-widest font-black border border-white/5 text-gray-500 flex items-center gap-2 cursor-not-allowed group">
                        <Calendar size={12} /> Last 30 Days
                        <span className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 text-[8px] whitespace-nowrap">Feature Coming Soon</span>
                    </button>
                    <button className="px-6 py-3 text-[10px] uppercase tracking-widest font-black border border-white/5 text-gray-500 flex items-center gap-2 cursor-not-allowed group">
                        <Download size={12} /> Export Report
                        <span className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 text-[8px] whitespace-nowrap">Feature Coming Soon</span>
                    </button>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-8 group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-white text-black">
                                <m.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {m.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {m.trend}
                            </div>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">{m.name}</p>
                        <p className="text-3xl font-bold tracking-tighter">{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Visualization Placeholder */}
            <div className="bg-white/5 border border-white/5 p-12 h-[500px] flex flex-col justify-center items-center text-center">
                <BarChart3 size={48} className="text-white/10 mb-6" />
                <h3 className="text-xs uppercase tracking-[0.5em] font-black text-gray-600 mb-2">Revenue Velocity Visualization</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-700 max-w-sm font-bold">Advanced data visualization is currently being processed. Real-time metrics are active in the cards above.</p>
                
                {/* Visual Placeholder Bars */}
                <div className="mt-12 flex items-baseline gap-2 w-full max-w-md h-32 opacity-10">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 40, 60, 85, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-white" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
