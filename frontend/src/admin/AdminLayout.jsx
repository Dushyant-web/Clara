import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    ShoppingBag,
    Mail,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    Bell,
    Tag,
    Users,
    MessageCircle,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Inventory', path: '/admin/products', icon: Box },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageCircle },
        { name: 'Promos', path: '/admin/promos', icon: Tag },
        { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
        { name: 'Analytics', path: '/admin/analytics', icon: Activity },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col z-20 bg-black/50 backdrop-blur-xl">
                <div className="p-8">
                    <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        GAURK<span className="opacity-40 text-xs tracking-widest ml-1 uppercase">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all group ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={16} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-1">
                    <Link to="/admin/settings" className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white transition-all">
                        <Settings size={16} />
                        Settings
                    </Link>
                    <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70 hover:text-red-500 transition-all">
                        <LogOut size={16} />
                        Exit Admin
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] z-10">
                    <div className="relative w-96 group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/40 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH INTELLIGENCE..."
                            className="bg-transparent border-none pl-8 text-[11px] uppercase tracking-[0.2em] focus:outline-none w-full text-white placeholder:text-white/10 font-bold"
                        />
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-6">
                            <button className="text-white/20 hover:text-white transition-colors">
                                <Activity size={18} />
                            </button>
                            <button className="text-white/20 hover:text-white transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="text-right">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-black leading-none text-white/90">DUSHYANT</p>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 mt-1.5 font-bold">SYSTEMS OPERATOR</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-tr from-white/10 to-white/5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={location.pathname}
                        className="p-12 max-w-7xl mx-auto w-full"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
