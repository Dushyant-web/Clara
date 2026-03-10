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
    Tag
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Inventory', path: '/admin/products', icon: Box },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
        { name: 'Promos', path: '/admin/promos', icon: Tag },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col z-20 bg-black/50 backdrop-blur-xl">
                <div className="p-8">
                    <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        NAME<span className="opacity-40 text-xs tracking-widest ml-1 uppercase">Admin</span>
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
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white transition-all">
                        <Settings size={16} />
                        Settings
                    </button>
                    <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70 hover:text-red-500 transition-all">
                        <LogOut size={16} />
                        Exit Admin
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/20 backdrop-blur-md z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ADMIN DATA..."
                            className="bg-transparent border-none pl-8 text-[10px] uppercase tracking-widest focus:outline-none w-full text-white placeholder:text-gray-700 font-bold"
                        />
                    </div>

                    <div className="flex items-center gap-8">
                        <button className="text-gray-500 hover:text-white transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
                        </button>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest font-black leading-none">Dushyant</p>
                                <p className="text-[8px] uppercase tracking-widest text-gray-500 mt-1">Super Admin</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10" />
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
