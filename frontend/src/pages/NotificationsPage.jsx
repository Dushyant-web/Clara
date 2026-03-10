import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { Bell, Check, Trash2 } from 'lucide-react';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getNotifications(user.id);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    if (loading) return <div className="h-screen bg-primary flex items-center justify-center text-secondary p-20 text-[10px] tracking-[0.5em] animate-pulse uppercase font-bold text-center">Developing Updates...</div>;

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-4xl text-secondary">
                <header className="mb-16">
                    <p className="text-[10px] tracking-[0.5em] font-bold text-gray-500 mb-4 uppercase">UPDATES</p>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase">Notifications</h1>
                </header>

                {notifications.length === 0 ? (
                    <div className="py-32 text-center border border-secondary/5 bg-secondary/5 space-y-6">
                        <Bell size={40} className="mx-auto text-gray-800" />
                        <p className="text-[10px] tracking-[0.3em] font-bold text-gray-500 uppercase">NO NEW NOTIFICATIONS.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode='popLayout'>
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-8 border border-secondary/5 flex justify-between items-center gap-8 ${notif.is_read ? 'opacity-40' : 'bg-secondary/5 border-l-2 border-l-secondary'}`}
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold tracking-tight uppercase">{notif.title}</h3>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest">{notif.message}</p>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {!notif.is_read && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all rounded-full border border-secondary/10"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
