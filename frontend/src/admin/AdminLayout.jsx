import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';

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
    Activity,
    Layers,
    FolderGit2,
    Image as ImageIcon,
    Menu,
    X,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const adminPassword = sessionStorage.getItem('admin_password');

    if (!adminPassword) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('admin_password');
        navigate('/');
    };


    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Inventory', path: '/admin/products', icon: Box },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageCircle },
        { name: 'Promos', path: '/admin/promos', icon: Tag },
        { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
        { name: 'Analytics', path: '/admin/analytics', icon: Activity },
        { name: 'Categories', path: '/admin/categories', icon: FolderGit2 },
        { name: 'Collections', path: '/admin/collections', icon: Layers },
        { name: 'Lookbooks', path: '/admin/lookbooks', icon: ImageIcon },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[30] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 border-r border-white/5 flex flex-col z-[40] bg-black/50 backdrop-blur-xl transition-transform duration-500 ease-[0.43,0.13,0.23,0.96]
                lg:translate-x-0 lg:static
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group transition-all">
                        <div className="w-8 h-8 relative overflow-hidden rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <img
                                src="/assets/logo/gk_logo.png"
                                alt="GAURK Icon"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-serif font-bold tracking-tighter leading-none">
                                GAURK
                            </span>
                            <span className="opacity-40 text-[8px] tracking-[0.3em] uppercase mt-1">Admin</span>
                        </div>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
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
                    <Link to="/admin/settings" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white transition-all">
                        <Settings size={16} />
                        Settings
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70 hover:text-red-500 transition-all text-left"
                    >
                        <LogOut size={16} />
                        Exit Admin
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 bg-[#050505] z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-white/40 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative w-48 md:w-96 group hidden sm:block">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/40 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                className="bg-transparent border-none pl-8 text-[11px] uppercase tracking-[0.2em] focus:outline-none w-full text-white placeholder:text-white/10 font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-10">
                        <div className="flex items-center gap-3 md:gap-6">
                            <button className="text-white/20 hover:text-white transition-colors hidden sm:block">
                                <Activity size={18} />
                            </button>
                            <button className="text-white/20 hover:text-white transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                            <div className="text-right hidden xs:block">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-black leading-none text-white/90">DUSHYANT</p>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 mt-1.5 font-bold">SYSTEMS OPERATOR</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all overflow-hidden shrink-0">
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
                        className="p-6 md:p-12 max-w-7xl mx-auto w-full"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
