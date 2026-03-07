import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, User } from 'lucide-react'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-80 md:w-96 bg-primary border border-secondary/10 overflow-hidden shadow-2xl transition-colors duration-500"
                    >
                        {/* Chat Header */}
                        <div className="bg-secondary p-6 flex justify-between items-center text-primary">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold">Elite Concierge</h3>
                                    <p className="text-[10px] opacity-60">Online • Typically replies instantly</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                        </div>

                        {/* Chat Body */}
                        <div className="h-80 p-6 overflow-y-auto space-y-4">
                            <div className="bg-secondary/5 p-4 rounded-sm text-[10px] uppercase tracking-widest leading-relaxed">
                                Welcome to CALRA Concierge. How can we assist you with your selection today?
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-secondary text-primary p-4 rounded-sm text-[10px] uppercase tracking-widest leading-relaxed">
                                    I'm looking for oversized fit recommendations.
                                </div>
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 border-t border-secondary/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="TYPE YOUR MESSAGE..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-transparent border-b border-secondary/20 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:border-secondary transition-all pr-10 text-secondary"
                                />
                                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-secondary text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    )
}

export default ChatWidget
