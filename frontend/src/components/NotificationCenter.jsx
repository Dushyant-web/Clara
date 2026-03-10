import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShoppingBag, Package, Star, X, Check } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

const NotificationCenter = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, clearAllNotifications } = useNotifications()

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package size={16} />
            case 'promo': return <Star size={16} />
            case 'cart': return <ShoppingBag size={16} />
            default: return <Bell size={16} />
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                        className="absolute top-12 right-0 w-80 md:w-96 bg-primary border border-secondary/10 z-50 overflow-hidden shadow-2xl origin-top-right transition-colors duration-500"
                    >
                        <div className="p-6 border-b border-secondary/5 flex justify-between items-center bg-secondary/5">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Activity Center</h3>
                            <button
                                onClick={clearAllNotifications}
                                className="text-[8px] uppercase tracking-widest font-bold text-gray-500 hover:text-secondary transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Bell size={32} className="mx-auto text-neutral-800 mb-4" />
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">No new updates yet.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-6 border-b border-secondary/5 hover:bg-secondary/5 transition-colors relative group ${!notif.read ? 'bg-secondary/[0.02]' : ''}`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute left-0 top-0 w-0.5 h-full bg-secondary" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-secondary/5 flex items-center justify-center shrink-0 border border-secondary/5">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest">{notif.title}</h4>
                                                    <span className="text-[8px] text-gray-600 uppercase font-bold">{notif.date}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed mb-4">
                                                    {notif.message}
                                                </p>
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-secondary border-b border-secondary pb-0.5"
                                                    >
                                                        <Check size={10} /> Mark as seen
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-secondary/5 text-center">
                            <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-secondary transition-colors">
                                View All Activity Center
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default NotificationCenter
