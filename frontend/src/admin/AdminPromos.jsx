import React, { useState, useEffect } from 'react';
import {
    Tag,
    Plus,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Percent,
    Infinity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';

const AdminPromos = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        max_discount: '',
        usage_limit: ''
    });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllPromos();
            setPromos(data || []);
        } catch (err) {
            console.error('Failed to load promos', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createPromo({
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_order_amount: parseFloat(formData.min_order_amount) || 0,
                max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
            });
            alert('PROMO CODE ARCHIVED.');
            setIsModalOpen(false);
            setFormData({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                min_order_amount: 0,
                max_discount: '',
                usage_limit: ''
            });
            fetchPromos();
        } catch (err) {
            console.error('Action failed', err);
            alert('CRITICAL ERROR: ACTION FAILED.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('PERMANENTLY VOID THIS PROMO CODE?')) {
            try {
                await adminService.deletePromo(id);
                setPromos(promos.filter(p => p.id !== id));
            } catch (err) {
                console.error('Purge failed', err);
            }
        }
    };

    const handleDisable = async (id) => {
        try {
            await adminService.disablePromo(id);
            setPromos(promos.map(p => p.id === id ? { ...p, active: false } : p));
        } catch (err) {
            console.error('Disable failed', err);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Discount Manifest</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage incentives, loyalty rewards, and elite codes</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                >
                    <Plus size={16} /> New Promo Code
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-8 h-48 animate-pulse" />
                    ))
                ) : promos.length === 0 ? (
                    <div className="col-span-full p-20 text-center opacity-30 text-[10px] uppercase tracking-[0.5em] font-black">No Active Codes</div>
                ) : (
                    promos.map((p) => (
                        <div key={p.id} className="bg-white/5 border border-white/5 p-8 group hover:border-white/10 transition-all relative">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-3 bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                                    <Tag size={18} />
                                </div>
                                <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-1 border ${p.active ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'
                                    }`}>
                                    {p.active ? 'ACTIVE' : 'DISABLED'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{p.code}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
                                {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `₹${p.discount_value} OFF`}
                                {parseFloat(p.min_order_amount) > 0 && ` • MIN ₹${p.min_order_amount}`}
                            </p>

                            <div className="space-y-2 mb-8">
                                <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-gray-500">
                                    <Infinity size={10} />
                                    <span>LIMIT: {p.usage_limit || 'UNLIMITED'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-gray-500">
                                    <Calendar size={10} />
                                    <span>CREATED: {new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {p.active && (
                                    <button
                                        onClick={() => handleDisable(p.id)}
                                        className="flex-1 py-3 border border-white/5 text-[8px] font-black uppercase tracking-widest hover:border-white transition-all"
                                    >
                                        Disable
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="p-3 border border-white/5 text-red-500/50 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl p-12 relative z-10"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-8 right-8 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-12">Create New Reward</h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Promo Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase placeholder:text-gray-800"
                                            placeholder="ELITE30"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Discount Type</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase appearance-none"
                                        >
                                            <option value="percentage">PERCENTAGE (%)</option>
                                            <option value="fixed">FIXED AMOUNT (INR)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Discount Value</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.discount_value}
                                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">
                                                {formData.discount_type === 'percentage' ? '%' : 'INR'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Minimum Order</label>
                                        <input
                                            type="number"
                                            value={formData.min_order_amount}
                                            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Max Discount (Cap)</label>
                                        <input
                                            type="number"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                            placeholder="NO LIMIT"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Usage Limit</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                            placeholder="UNLIMITED"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all font-inter"
                                    >
                                        Commission Promo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPromos;
