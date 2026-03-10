import React, { useState } from 'react';
import {
    Mail,
    Send,
    Users,
    Edit3,
    Eye,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { newsletterService } from '../services/newsletterService';

const AdminNewsletter = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        content: ''
    });
    const [sendingId, setSendingId] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await newsletterService.createNewsletter(formData);
            alert('NEWSLETTER ARCHIVED AND READY FOR DISPATCH.');
            setIsCreating(false);
            setFormData({ subject: '', content: '' });
        } catch (err) {
            console.error('Creation failed', err);
        }
    };

    const handleSend = async (id) => {
        setSendingId(id);
        try {
            await newsletterService.sendNewsletter(id);
            alert('TRANSMISSION COMPLETE. BROADCAST SENT TO ELITE LIST.');
        } catch (err) {
            console.error('Broadcast failed', err);
        } finally {
            setSendingId(null);
        }
    };

    const drafts = [
        { id: 1, subject: 'NEW COLLECTION: THE NOIR SERIES', date: '2026-03-10', status: 'draft' },
        { id: 2, subject: 'EXCLUSIVE ACCESS: PRIVATE SALE', date: '2026-03-08', status: 'sent' }
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Broadcast Center</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage community engagement and elite communications</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                    >
                        <Edit3 size={16} /> Draft New Broadcast
                    </button>
                )}
            </header>

            {isCreating ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-12 max-w-4xl"
                >
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-12">New Communication</h2>
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Subject Line</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase tracking-widest"
                                placeholder="THE COMMAND: [SUBJECT]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Body Content (Markdown Supported)</label>
                            <textarea
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-black border border-white/10 p-6 text-xs font-bold leading-relaxed focus:outline-none focus:border-white transition-all uppercase"
                                placeholder="ARCHIVE ANNOUNCEMENT CONTENT..."
                                required
                            />
                        </div>
                        <div className="flex gap-4 pt-8">
                            <button className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90">Save Draft</button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-12 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map((d) => (
                        <div key={d.id} className="bg-white/5 border border-white/5 p-8 group hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-3 bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-1 border ${d.status === 'sent' ? 'border-green-500/30 text-green-500' : 'border-amber-500/30 text-amber-500'
                                    }`}>
                                    {d.status}
                                </span>
                            </div>
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black mb-4 line-clamp-2">{d.subject}</h3>
                            <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-12">Archived: {d.date}</p>

                            <div className="flex gap-2">
                                <button className="flex-1 py-3 border border-white/5 text-[8px] font-black uppercase tracking-widest hover:border-white transition-all">View</button>
                                {d.status === 'draft' && (
                                    <button
                                        onClick={() => handleSend(d.id)}
                                        disabled={sendingId === d.id}
                                        className="flex-1 py-3 bg-white text-black text-[8px] font-black uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={10} /> {sendingId === d.id ? 'SENDING...' : 'Dispatch'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminNewsletter;
