import { motion } from 'framer-motion'
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    ArrowUpRight, ArrowDownRight, Package, Truck,
    AlertCircle, ChevronRight
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const data = [
    { name: 'Mon', revenue: 0, orders: 0 },
    { name: 'Tue', revenue: 0, orders: 0 },
    { name: 'Wed', revenue: 0, orders: 0 },
    { name: 'Thu', revenue: 0, orders: 0 },
    { name: 'Fri', revenue: 0, orders: 0 },
    { name: 'Sat', revenue: 0, orders: 0 },
    { name: 'Sun', revenue: 0, orders: 0 },
]

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Revenue', value: '₹0', change: '0%', icon: DollarSign, positive: true },
        { label: 'Total Orders', value: '0', change: '0%', icon: ShoppingBag, positive: true },
        { label: 'Total Customers', value: '0', change: '0%', icon: Users, positive: true },
        { label: 'Conversion Rate', value: '0%', change: '0%', icon: TrendingUp, positive: true },
    ]

    return (
        <div className="min-h-screen bg-black text-white p-8 lg:p-12">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif tracking-tighter uppercase mb-2">Command Center</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Luxury Brand Administration • V1.0.4</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-white transition-all">Export Report</button>
                    <button className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">New Drop</button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 p-8 border border-white/5 relative overflow-hidden group">
                        <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 block font-bold">{stat.label}</span>
                            <div className="flex items-end justify-between">
                                <h2 className="text-3xl font-serif">{stat.value}</h2>
                                <div className={`flex items-center text-[10px] font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-neutral-900 p-10 border border-white/5">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12 text-gray-400">Revenue Performance</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                        itemStyle={{ color: '#FFF' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#FFF" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-neutral-900 p-10 border border-white/5">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-gray-400">Inventory Status</h3>
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600">Inventory Sync Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900 p-10 border border-white/5 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle size={24} className="text-gray-500" />
                            </div>
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Pending Returns</h4>
                            <p className="text-4xl font-serif mb-6">0</p>
                            <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white hover:text-grayAccent transition-colors">Action Required</button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Sidebar */}
                <div className="lg:col-span-4 bg-neutral-900 border border-white/5 p-10">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12 text-gray-400">Live Orders</h3>
                    <div className="space-y-8">
                        <div className="text-center py-12">
                            <p className="text-[10px] uppercase tracking-widest text-gray-600">No active orders</p>
                        </div>
                    </div>
                    <button className="w-full mt-12 py-4 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-white transition-all">View All Orders</button>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
