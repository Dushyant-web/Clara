import React, { useState, useEffect } from 'react';
import {
    Star,
    Trash2,
    Filter,
    MessageCircle,
    User,
    ChevronDown,
    Loader2,
    Search,
    TrendingUp,
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [ratingFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const rating = ratingFilter === 'All' ? null : parseInt(ratingFilter);
            const [reviewsData, statsData] = await Promise.all([
                adminService.getReviews(rating),
                adminService.getReviewStats()
            ]);
            
            // Standardize results (handle cases where backend wraps data in keys)
            setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData?.reviews || []));
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load review data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('PERMANENTLY REMOVE THIS ENTRY FROM THE PUBLIC VESTIBULE?')) {
            try {
                await adminService.deleteReview(reviewId);
                setReviews(reviews.filter(r => r.id !== reviewId));
                // Refresh stats
                const statsData = await adminService.getReviewStats();
                setStats(statsData);
            } catch (err) {
                console.error('Delete failed', err);
            }
        }
    };

    const filteredReviews = reviews.filter(r => 
        (r.comment?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderStars = (rating, size = 8) => (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={i < rating ? 'fill-white text-white' : 'text-white/10'}
                />
            ))}
        </div>
    );

    if (loading && !reviews.length) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin text-white/20" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col gap-8">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30">Reputation Moderation</p>
                    <h1 className="text-5xl font-medium tracking-tight font-serif text-white/90">Review Intelligence</h1>
                </div>

                {/* Quick Filters - Minimal Outlined Boxes */}
                <div className="flex flex-wrap gap-2">
                    {['All', '5', '4', '3', '2', '1'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRatingFilter(r)}
                            className={`px-5 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                                ratingFilter === r 
                                ? 'bg-white text-black border-white' 
                                : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                            }`}
                        >
                            {r === 'All' ? 'ALL' : `${r} \u2606`}
                        </button>
                    ))}
                </div>
            </header>

            {/* Intelligence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.03] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Average Sentiment</p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black tracking-tight text-white/90 uppercase">
                            {stats?.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <div>
                           {renderStars(Math.round(stats?.average_rating || 0), 10)}
                        </div>
                    </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Total Testimonials</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black tracking-tight text-white/90">
                            {stats?.total_count || reviews.length || 0}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-emerald-500/80 font-black flex items-center gap-1.5 self-end mb-1">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live
                        </span>
                    </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Pending Moderation</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-medium tracking-tight text-white/20">0</span>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600 font-black self-end mb-1 underline underline-offset-4 decoration-gray-800">No Signal Delay</span>
                    </div>
                </div>
            </div>

            {/* Moderation Manifest */}
            <div className="space-y-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-10">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input 
                            type="text"
                            placeholder="SEARCH INTELLIGENCE / IDENTITY / KEYWORD..."
                            className="bg-transparent border-none pl-8 text-[11px] uppercase tracking-[0.2em] focus:outline-none w-full text-white placeholder:text-white/10 font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Identity</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Appraisal</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Feedback Manifest</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Chronology</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-24 text-center">
                                       <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/10">No Feedback Entries Identified</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((r) => (
                                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 border border-white/5 flex items-center justify-center grayscale opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <User size={14} className="text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                                                        {r.user_email || 'Verified Patron'}
                                                    </p>
                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-medium">Digital Identity</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-3">
                                                {renderStars(r.rating, 10)}
                                                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">{r.rating}/5 SIGNAL</p>
                                            </div>
                                        </td>
                                        <td className="p-8 max-w-md">
                                            <p className="text-xs text-white/70 font-serif italic leading-relaxed">
                                                "{r.comment}"
                                            </p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="px-2 py-0.5 border border-white/5 text-[9px] uppercase tracking-[0.2em] font-bold text-white/20">
                                                    PIECE #{r.product_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">
                                                {new Date(r.created_at).toLocaleDateString(undefined, {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button
                                                    onClick={() => handleDeleteReview(r.id)}
                                                    className="p-3 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:border-red-500/20 transition-all"
                                                    title="PURGE ENTRY"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
