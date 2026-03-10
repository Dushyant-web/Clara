import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { orderService } from '../services/orderService'

const AccountPage = () => {
    const { user, logout } = useAuth()
    const { wishlist } = useCart()
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        const fetchAccountData = async () => {
            try {
                const orders = await orderService.getUserOrders(user.id)
                setRecentOrders(orders || [])
            } catch (err) {
                console.error('Failed to load account data', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAccountData()
    }, [user, navigate])

    const menuItems = [
        { name: 'Order History', icon: Package, count: recentOrders.length },
        { name: 'My Wishlist', icon: Heart, count: wishlist.length, link: '/wishlist' },
        { name: 'Saved Addresses', icon: MapPin, link: '/account/addresses' },
        { name: 'Account Settings', icon: Settings },
    ]

    if (!user) return null

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-secondary/5 border border-secondary/10 rounded-full flex items-center justify-center text-secondary text-2xl font-serif">
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif tracking-tighter uppercase">{user.name || 'User'}</h1>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Member since {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-secondary transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-4">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.link || '#'}
                                className="w-full flex justify-between items-center p-6 bg-secondary/5 border border-secondary/10 hover:border-secondary transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <item.icon size={20} className="text-gray-500 group-hover:text-secondary transition-colors" />
                                    <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
                                </div>
                                {item.count !== undefined && (
                                    <span className="bg-secondary/5 px-2 py-1 text-[10px] font-bold text-gray-500">{item.count}</span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Recent Orders */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recent Orders</h2>
                                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-secondary">View All</button>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="bg-secondary/5 p-12 border border-secondary/10 animate-pulse"></div>
                                ) : recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div key={order.order_id} className="bg-secondary/5 p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-secondary/10 hover:border-secondary/20 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center">
                                                    <Package size={20} className="text-secondary/40" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Order #{order.order_id}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: {order.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-sm font-serif">₹{order.total_amount}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-600" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-secondary/5 p-12 border border-secondary/10 text-center">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">No orders found</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Recently Viewed (Demo) */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recently Viewed</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 opacity-40">
                                <div className="aspect-[3/4] bg-secondary/10 border border-secondary/10" />
                                <div className="aspect-[3/4] bg-secondary/10 border border-secondary/10" />
                                <div className="aspect-[3/4] bg-secondary/10 border border-secondary/10" />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountPage
