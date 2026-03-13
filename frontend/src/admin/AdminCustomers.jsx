import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    ShoppingBag,
    TrendingUp,
    ChevronRight,
    Loader2,
    X,
    Clock,
    CreditCard,
    MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';

const CustomerProfileSidePanel = ({ user, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // Fetch profile and reviews independently to avoid one failure blocking the other
                    const profilePromise = adminService.getUserProfile(user.id).catch(err => {
                        console.error('Profile fetch failed:', err);
                        return { orders: [] }; // Fallback to empty orders
                    });
                    const [profileData, allReviewsResponse] = await Promise.all([
                        adminService.getUserProfile(user.id).catch(err => {
                            console.error('Profile fetch failed:', err);
                            return null; // Return null on error so normalizedProfile can handle it
                        }),
                        adminService.getReviews().catch(err => {
                            console.error('Reviews fetch failed:', err);
                            return []; // Return empty array on error
                        })
                    ]);
                    
                    const normalizedProfile = profileData || { orders: [], reviews: [] };
                    setProfile(normalizedProfile);
                    
                    // Use reviews from profile if available, otherwise fallback to filtering all reviews
                    if (normalizedProfile.reviews && normalizedProfile.reviews.length > 0) {
                        setUserReviews(normalizedProfile.reviews);
                    } else {
                        // Fallback filter by email if profile didn't have reviews
                        const normalizedAllReviews = Array.isArray(allReviewsResponse) ? allReviewsResponse : (allReviewsResponse?.reviews || []);
                        const filtered = normalizedAllReviews.filter(r => 
                            (r.user_email?.toLowerCase() === user.email?.toLowerCase()) || 
                            (Number(r.user_id) === Number(user.id))
                        );
                        setUserReviews(filtered);
                    }

                } catch (err) {
                    console.error('Critical failure in Customer Intelligence fetch:', err);
                    // Set a basic profile to avoid "Data Retrieval Failed" if we have the user object
                    setProfile({ orders: [] });
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (!user) return null;

    // Use fetched profile or default to empty orders
    const orders = profile?.orders || [];
    const calculatedTotalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    const calculatedTotalOrders = orders.length;

    return (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Customer Intelligence</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-white/20" /></div>
                ) : profile ? (
                    <div className="space-y-12">
                        {/* Summary Header */}
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mx-auto mb-6 flex items-center justify-center">
                                <span className="text-2xl font-black">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tighter text-white/90">{user.email}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/20 mt-2 font-bold select-none">ID: {user.id} • LOYALTY TIER: ELITE</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.03] p-6 border border-white/5">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3 font-bold">Total Spent</p>
                                <p className="text-2xl font-black tracking-tight">₹{calculatedTotalSpent.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/[0.03] p-6 border border-white/5">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3 font-bold">Order Count</p>
                                <p className="text-2xl font-black tracking-tight">{calculatedTotalOrders}</p>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                <Clock size={12} /> Recent Archives
                            </h4>
                            <div className="space-y-1">
                                {orders.length > 0 ? orders.map((o) => (
                                    <div key={o.id} className="p-6 bg-white/[0.02] border border-white/5 flex justify-between items-center hover:bg-white/[0.04] transition-all group">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Order #{o.id}</p>
                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-medium">{new Date(o.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[11px] font-black text-white/90">₹{parseFloat(o.total_total || o.total_amount).toLocaleString()}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${o.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-amber-500'}`}>{o.status}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black text-center py-12 border border-dashed border-white/5">No Archives Found</p>}
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                <MessageCircle size={12} /> Review History
                            </h4>
                            <div className="space-y-2">
                                {userReviews.length > 0 ? userReviews.map((r) => (
                                    <div key={r.id} className="p-8 bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-2 h-2 ${i < r.rating ? 'bg-white' : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-white/60 font-serif italic leading-relaxed">"{r.comment}"</p>
                                        <div className="flex justify-between items-center pt-2">
                                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">PIECE #{r.product_id}</p>
                                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black text-center py-12 border border-dashed border-white/5">No Review Contributions</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                        <X size={48} className="mb-4" />
                        <p className="text-[10px] uppercase tracking-[0.5em] font-black">Data Retrieval Failed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Customer Intelligence</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Monitor engagement and historical consumption patterns</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input
                        type="text"
                        placeholder="IDENTIFY PATRON..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-white transition-all"
                    />
                </div>
            </header>

            <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Patron</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Role</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Tier</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Status</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 text-right">Intelligence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-white/5">
                                    <td colSpan={5} className="p-8 h-20 bg-white/2" />
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center opacity-30 text-[10px] uppercase tracking-[0.5em] font-black">No Patron Matches Found</td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 group transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                <span className="text-[10px] font-black">{u.email?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">{u.email}</p>
                                                <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black border ${u.is_admin ? 'border-amber-500/30 text-amber-500' : 'border-white/10 text-gray-500'}`}>
                                            {u.is_admin ? 'ADMIN' : 'MEMBER'}
                                        </span>
                                    </td>
                                    <td className="p-6"><span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">T-I</span></td>
                                    <td className="p-6"><span className="text-[8px] text-emerald-500 uppercase tracking-widest font-black flex items-center gap-2"><div className="w-1 h-1 bg-current rounded-full" /> ACTIVE</span></td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => setSelectedUser(u)}
                                            className="px-6 py-2 border border-white/5 group-hover:border-white transition-all text-[8px] font-black uppercase tracking-widest"
                                        >
                                            Examine Profile
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                            onClick={() => setSelectedUser(null)}
                        />
                        <CustomerProfileSidePanel
                            user={selectedUser}
                            onClose={() => setSelectedUser(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCustomers;
