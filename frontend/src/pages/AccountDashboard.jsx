import { motion } from 'framer-motion'
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../hooks/useCartStore'

const AccountDashboard = () => {
    const { wishlist } = useCartStore()

    const recentOrders = [
        { id: 'ORD-12345', date: 'Oct 24, 2026', total: 745.00, status: 'Shipped' },
        { id: 'ORD-12340', date: 'Sep 12, 2026', total: 185.00, status: 'Delivered' },
    ]

    const menuItems = [
        { name: 'Order History', icon: Package, count: 12 },
        { name: 'My Wishlist', icon: Heart, count: wishlist.length, link: '/wishlist' },
        { name: 'Saved Addresses', icon: MapPin },
        { name: 'Account Settings', icon: Settings },
    ]

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center text-white text-2xl font-serif">
                            DS
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif tracking-tighter uppercase">Dushyant S.</h1>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Premium Member since 2024</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-4">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                className="w-full flex justify-between items-center p-6 bg-neutral-900/50 border border-white/5 hover:border-white/20 transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <item.icon size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                                    <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
                                </div>
                                {item.count !== undefined && (
                                    <span className="bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-500">{item.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Recent Orders */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recent Orders</h2>
                                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white">View All</button>
                            </div>
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="bg-neutral-900 p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center">
                                                <Package size={20} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest">{order.id}</p>
                                                <div className="flex gap-4 mt-1 text-[10px] text-gray-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {order.date}</span>
                                                    <span className="text-white">${order.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 border ${order.status === 'Shipped' ? 'border-blue-500/20 text-blue-400' : 'border-green-500/20 text-green-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <Link to={`/order-tracking/${order.id}`} className="p-2 hover:bg-white/5 transition-colors">
                                                <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recently Viewed (Demo) */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recently Viewed</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 opacity-40">
                                <div className="aspect-[3/4] bg-neutral-900 border border-white/5" />
                                <div className="aspect-[3/4] bg-neutral-900 border border-white/5" />
                                <div className="aspect-[3/4] bg-neutral-900 border border-white/5" />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountDashboard
