import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react'

const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const [alerts, setAlerts] = useState([])

    // Global Alerts (Toast style)
    const showAlert = useCallback((message, type = 'info') => {
        const id = Date.now()
        setAlerts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id))
        }, 5000)
    }, [])

    // Persistent Notifications (Dropdown style)
    const addNotification = useCallback((title, message, type = 'order') => {
        const id = Date.now()
        setNotifications(prev => [{ id, title, message, type, read: false, date: 'JUST NOW' }, ...prev])
    }, [])

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const clearAllNotifications = () => {
        setNotifications([])
    }

    return (
        <NotificationContext.Provider value={{ notifications, alerts, showAlert, addNotification, markAsRead, clearAllNotifications }}>
            {children}

            {/* Toast Alert UI */}
            <div className="fixed bottom-12 left-12 z-[200] space-y-4 max-w-sm w-full">
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            className="bg-white p-6 shadow-2xl flex items-center gap-6 border-l-4 border-black group"
                        >
                            <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0">
                                {alert.type === 'success' ? <CheckCircle2 size={20} className="text-white" /> :
                                    alert.type === 'error' ? <AlertCircle size={20} className="text-white" /> :
                                        <Info size={20} className="text-white" />}
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{alert.message}</p>
                            </div>
                            <button
                                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                className="text-gray-300 hover:text-black transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}
