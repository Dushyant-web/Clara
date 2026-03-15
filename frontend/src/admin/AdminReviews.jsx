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
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState('All');
    const [replyDrafts, setReplyDrafts] = useState({});
    const [sendingReply, setSendingReply] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [moderationQueue, setModerationQueue] = useState([]);

    // --- Product Analytics State ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productBreakdown, setProductBreakdown] = useState(null);

    useEffect(() => {
        fetchData();
    }, [ratingFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const rating = ratingFilter === 'All' ? null : parseInt(ratingFilter);
            const [reviewsData, statsData, intelligenceData, timelineData, queueData] = await Promise.all([
                adminService.getReviews(rating),
                adminService.getReviewStats(),
                adminService.getReviewIntelligence(),
                adminService.getReviewTimeline(),
                adminService.getModerationQueue()
            ]);

            // Standardize results (handle cases where backend wraps data in keys)
            setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData?.reviews || []));
            setStats(statsData);
            setIntelligence(intelligenceData);
            setTimeline(timelineData || []);
            setModerationQueue(queueData || []);
        } catch (err) {
            console.error('Failed to load review data', err);
        } finally {
            setLoading(false);
        }
    };

    // --- Load Product Analytics ---
    const loadProductAnalytics = async (productId) => {
        try {
            const data = await adminService.getProductReviewBreakdown(productId);
            setSelectedProduct(productId);
            setProductBreakdown(data);
        } catch (err) {
            console.error('Failed to load product analytics', err);
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

    const filteredReviews = reviews;

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
            <header className="flex flex-col gap-8 border-b border-white/10 pb-12">
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/40">Reputation Moderation</p>
                    <h1 className="text-4xl font-serif tracking-tight text-white/90">Review Intelligence</h1>
                </div>

                {/* Quick Filters - Minimal Outlined Boxes */}
                <div className="flex flex-wrap gap-2">
                    {['All', '5', '4', '3', '2', '1'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRatingFilter(r)}
                            className={`px-5 py-2 text-[9px] uppercase tracking-[0.4em] font-medium border transition-all ${ratingFilter === r
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/80'
                                }`}
                        >
                            {r === 'All' ? 'ALL' : `${r} \u2606`}
                        </button>
                    ))}
                </div>
            </header>

            {/* Intelligence Cards */}
            {/* Review Intelligence Overview */}
            {intelligence && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">
                            Website Rating
                        </p>
                        <p className="text-3xl font-serif text-white/90">
                            {intelligence.website_rating}
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">
                            Total Reviews
                        </p>
                        <p className="text-3xl font-serif text-white/90">
                            {intelligence.total_reviews}
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">
                            Best Product
                        </p>
                        <p className="text-sm text-white/80 uppercase tracking-widest">
                            {intelligence.best_product?.name || '—'}
                        </p>
                        <p className="text-[10px] tracking-widest text-white/40 mt-2">
                            ⭐ {intelligence.best_product?.rating}
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">
                            Worst Product
                        </p>
                        <p className="text-sm text-white/80 uppercase tracking-widest">
                            {intelligence.worst_product?.name || '—'}
                        </p>
                        <p className="text-[10px] tracking-widest text-white/40 mt-2">
                            ⭐ {intelligence.worst_product?.rating}
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">
                            Review Growth
                        </p>

                        <p className="text-sm text-white/80 uppercase tracking-widest">
                            {Array.isArray(intelligence.review_growth) ? intelligence.review_growth.length : 0} days
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-2">
                            Activity Recorded
                        </p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">Average Sentiment</p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-serif text-white/90">
                            {stats?.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <div>
                            {renderStars(Math.round(stats?.average_rating || 0), 10)}
                        </div>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">Total Testimonials</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-serif text-white/90">
                            {stats?.total_count || reviews.length || 0}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-emerald-500/80 font-medium flex items-center gap-1.5 self-end mb-2">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live
                        </span>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-10 flex flex-col justify-between h-40">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">Pending Moderation</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-serif text-white/30">0</span>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-medium self-end mb-2 border-b border-white/10 pb-1">No Signal Delay</span>
                    </div>
                </div>
            </div>

            {/* Review Breakdown (Star Distribution) */}
            {stats && stats.ratings && (
                <div className="space-y-8 mt-24">
                    <h2 className="text-2xl font-serif text-white/90 uppercase tracking-widest">
                        Review Breakdown
                    </h2>

                    <div className="bg-white/[0.02] border border-white/5 p-10 space-y-6">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.ratings?.[star] || stats.ratings?.[String(star)] || 0;
                            const total = stats.total_reviews || 1;
                            const percent = (count / total) * 100;

                            return (
                                <div key={star} className="flex items-center gap-6">

                                    <div className="w-12 text-[10px] uppercase tracking-widest text-white/60">
                                        {star}★
                                    </div>

                                    <div className="flex-1 h-[1px] bg-white/10 relative">
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-white/80 transition-all duration-1000 ease-out"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    <div className="w-12 text-[10px] uppercase tracking-widest text-white/60 text-right">
                                        {count}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Product Review Rankings */}
            {intelligence?.product_rankings && (
                <div className="space-y-6 mt-16">
                    <h2 className="text-2xl font-serif text-white/90">Product Review Rankings</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-4 text-xs text-white/40 uppercase">Rank</th>
                                    <th className="p-4 text-xs text-white/40 uppercase">Product</th>
                                    <th className="p-4 text-xs text-white/40 uppercase">Rating</th>
                                    <th className="p-4 text-xs text-white/40 uppercase">Reviews</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intelligence.product_rankings.map((p) => (
                                    <tr
                                        key={p.product_id}
                                        className="border-b border-white/5 cursor-pointer hover:bg-white/[0.03]"
                                        onClick={() => loadProductAnalytics(p.product_id)}
                                    >
                                        <td className="p-4 text-white">{p.rank}</td>
                                        <td className="p-4 text-white/80">{p.product_name}</td>
                                        <td className="p-4 text-white">⭐ {p.avg_rating}</td>
                                        <td className="p-4 text-white/60">{p.review_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Analytics Panel */}
            {selectedProduct && productBreakdown && (
                <div className="mt-10 border border-white/10 p-8 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-serif text-white">Product Review Analytics</h3>
                        <button
                            onClick={() => {
                                setSelectedProduct(null);
                                setProductBreakdown(null);
                            }}
                            className="text-xs uppercase tracking-wider text-white/40 hover:text-white"
                        >
                            Close
                        </button>
                    </div>

                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = productBreakdown?.[star] || productBreakdown?.[String(star)] || 0;
                            const total = Object.values(productBreakdown).reduce((a, b) => a + b, 0) || 1;
                            const percent = (count / total) * 100;

                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <div className="w-10 text-xs text-white/70">{star}★</div>
                                    <div className="flex-1 h-2 bg-white/10 relative">
                                        <div
                                            className="absolute left-0 top-0 h-2 bg-white"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="w-10 text-xs text-white/50">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Moderation Manifest */}
            <div className="space-y-10">
                <div className="border-b border-white/5 pb-10"></div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Identity</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Appraisal</th>
                                <th className="p-8 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Review Details</th>
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
                                                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/80">
                                                        {r.user_email || 'Verified Patron'}
                                                    </p>
                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-medium">Digital Identity</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-3">
                                                {renderStars(r.rating, 10)}
                                                <p className="text-[9px] uppercase font-medium tracking-[0.2em] text-white/30">{r.rating}/5 SIGNAL</p>
                                            </div>
                                        </td>
                                        <td className="p-8 max-w-md">
                                            <p className="text-xs text-white/80 font-serif leading-relaxed">
                                                "{r.comment}"
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-3">

                                                {/* Product Reference */}
                                                <div className="px-2 py-0.5 border border-white/5 text-[9px] uppercase tracking-[0.2em] font-medium text-white/20">
                                                    PRODUCT #{r.product_id}
                                                </div>

                                                {/* Variant Label */}
                                                {(r.color || r.size) && (
                                                    <div className="px-2 py-0.5 border border-white/5 text-[9px] uppercase tracking-[0.2em] font-medium text-white/40">
                                                        {r.color ? `Color: ${r.color}` : ''} {r.size ? `Size: ${r.size}` : ''}
                                                    </div>
                                                )}

                                                {/* Verified Purchase */}
                                                {r.verified_purchase && (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 border border-emerald-500/10 text-[9px] uppercase tracking-[0.2em] font-medium text-emerald-400">
                                                        <CheckCircle2 size={10} />
                                                        Verified
                                                    </div>
                                                )}

                                                {/* Helpful Votes */}
                                                {typeof r.helpful_count === 'number' && (
                                                    <div className="px-2 py-0.5 border border-white/10 text-[9px] uppercase tracking-[0.2em] font-medium text-white/40">
                                                        Helpful: {r.helpful_count}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Media Preview */}
                                            {(r.images?.length > 0 || r.videos?.length > 0) && (
                                                <div className="mt-4 flex gap-3 flex-wrap">

                                                    {r.images?.map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img}
                                                            alt="review media"
                                                            className="w-16 h-16 object-cover border border-white/10"
                                                        />
                                                    ))}

                                                    {r.videos?.map((vid, i) => (
                                                        <video
                                                            key={i}
                                                            src={vid}
                                                            controls
                                                            className="w-20 h-16 border border-white/10"
                                                        />
                                                    ))}

                                                </div>
                                            )}

                                            {/* Admin Reply System */}
                                            <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
                                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-medium">
                                                    Admin Reply
                                                </p>

                                                {/* Existing Admin Replies */}
                                                {r.replies && r.replies.length > 0 && (
                                                    <div className="space-y-2">
                                                        {r.replies.map((rep) => (
                                                            <div
                                                                key={rep.id}
                                                                className="flex justify-between items-start bg-white/[0.03] border border-white/10 p-2 text-xs text-white/80"
                                                            >
                                                                <div>
                                                                    <p className="text-white/80">{rep.reply}</p>
                                                                    <p className="text-[9px] text-white/30">
                                                                        {new Date(rep.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await adminService.deleteReply(rep.id);
                                                                            fetchData();
                                                                        } catch (err) {
                                                                            console.error('Reply delete failed', err);
                                                                        }
                                                                    }}
                                                                    className="text-red-400 text-[9px] uppercase tracking-wider hover:text-red-500"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <textarea
                                                    value={replyDrafts[r.id] || ''}
                                                    onChange={(e) =>
                                                        setReplyDrafts({
                                                            ...replyDrafts,
                                                            [r.id]: e.target.value
                                                        })
                                                    }
                                                    placeholder="Respond to this customer review..."
                                                    className="w-full bg-white/[0.02] border border-white/10 text-xs text-white p-3 resize-none focus:outline-none focus:border-white/30"
                                                    rows={2}
                                                />

                                                <button
                                                    disabled={sendingReply === r.id}
                                                    onClick={async () => {
                                                        try {
                                                            setSendingReply(r.id);

                                                            await adminService.replyToReview({
                                                                review_id: r.id,
                                                                reply: replyDrafts[r.id]
                                                            });

                                                            setReplyDrafts({ ...replyDrafts, [r.id]: '' });
                                                            fetchData();
                                                        } catch (err) {
                                                            console.error('Reply failed', err);
                                                        } finally {
                                                            setSendingReply(null);
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-[9px] uppercase tracking-[0.3em] border border-white/20 text-white/70 hover:bg-white hover:text-black transition-all"
                                                >
                                                    {sendingReply === r.id ? 'Sending...' : 'Reply'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
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
            {/* Review Timeline */}
            <div className="space-y-6 mt-16">
                <h2 className="text-2xl font-serif text-white/90">
                    Review Timeline
                </h2>

                <div>
                    {timeline.length === 0 ? (
                        <p className="text-xs text-white/30">No review activity yet</p>
                    ) : (
                        <div className="flex items-end gap-3 h-40">
                            {timeline.map((t, i) => {
                                const max = Math.max(...timeline.map(x => x.reviews));
                                const height = max > 0 ? (t.reviews / max) * 160 : 0;

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-6 bg-white/80"
                                            style={{ height: `${height}px` }}
                                        />
                                        <span className="text-[9px] text-white/40">
                                            {t.date.slice(5)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Moderation Queue */}
            <div className="space-y-6 mt-16 pointer-events-none opacity-50">
                <h2 className="text-2xl font-serif text-white/90">
                    Moderation Queue (Inactive)
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-xs text-white/40 uppercase">ID</th>
                                <th className="p-4 text-xs text-white/40 uppercase">User</th>
                                <th className="p-4 text-xs text-white/40 uppercase">Review</th>
                                <th className="p-4 text-xs text-white/40 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moderationQueue.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-xs text-white/30 text-center">
                                        No reviews require moderation
                                    </td>
                                </tr>
                            ) : moderationQueue.map((q) => (
                                <tr key={q.review_id} className="border-b border-white/5">
                                    <td className="p-4 text-white/70">{q.review_id}</td>
                                    <td className="p-4 text-white/80">{q.user}</td>
                                    <td className="p-4 text-white/70">{q.comment}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteReview(q.review_id)}
                                            className="text-red-400 text-xs uppercase tracking-wider hover:text-red-500"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;