import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle2, X } from 'lucide-react'

const PWAInstallPrompt = () => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 right-8 z-[110] max-w-sm w-full"
                >
                    <div className="bg-black dark:bg-white p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)] border border-white/10 dark:border-black/10 flex items-center gap-8 relative overflow-hidden transition-colors duration-500">
                        <div className="w-16 h-16 bg-white dark:bg-black flex items-center justify-center shrink-0">
                            <Download size={28} className="text-black dark:text-white" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xs text-white dark:text-black font-black uppercase tracking-[0.3em] mb-2 leading-tight">Add to Home Screen</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">Premium full-screen experience for CALRA.</p>
                            <div className="flex gap-6 mt-6">
                                <button className="text-[10px] font-black uppercase tracking-[0.3em] text-white dark:text-black border-b-2 border-white dark:border-black pb-1 hover:opacity-50 transition-all">Install App</button>
                                <button onClick={() => setShow(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:opacity-100 transition-all">Later</button>
                            </div>
                        </div>
                        <button onClick={() => setShow(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white dark:hover:text-black transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PWAInstallPrompt
