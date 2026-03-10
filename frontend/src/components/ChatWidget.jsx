import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react'
import { aiService } from '../services/aiService'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Welcome to NAME Elite Concierge. How can we assist you with your selection today?' }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e) => {
        if (e) e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const response = await aiService.chat(userMsg)
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply, products: response.products }])
        } catch (error) {
            console.error('Chat failed', error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Forgive me, my connection to the atelier is currently interrupted. Please try again shortly.' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-80 md:w-96 bg-primary border border-secondary/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col transition-colors duration-500"
                    >
                        {/* Chat Header */}
                        <div className="bg-secondary p-6 flex justify-between items-center text-primary">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 bg-white/10 backdrop-blur-md">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black">Elite Concierge</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <p className="text-[9px] uppercase tracking-widest opacity-60">AI Assistant Online</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div ref={scrollRef} className="h-96 md:h-[400px] p-6 overflow-y-auto space-y-6 bg-primary scroll-smooth">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-sm text-[10px] uppercase tracking-widest leading-relaxed font-bold ${msg.role === 'user'
                                            ? 'bg-secondary text-primary'
                                            : 'bg-secondary/5 border border-secondary/10 text-secondary'
                                        }`}>
                                        {msg.content}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-4 flex flex-col gap-2 border-t border-secondary/10 pt-4">
                                                <p className="text-[8px] opacity-40">Suggested Pieces:</p>
                                                {msg.products.map((p, i) => (
                                                    <span key={i} className="text-secondary hover:underline cursor-pointer">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary/5 border border-secondary/10 p-4 rounded-sm">
                                        <Loader2 size={16} className="animate-spin text-secondary/40" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSend} className="p-6 border-t border-secondary/5 bg-primary">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="TYPE YOUR MESSAGE..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-transparent border-b border-secondary/20 py-3 text-[10px] uppercase tracking-widest focus:outline-none focus:border-secondary transition-all pr-10 text-secondary placeholder:text-secondary/20 font-bold"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:scale-110 disabled:opacity-20 transition-all"
                                >
                                    <Send size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-secondary text-primary rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-2xl transition-all duration-300 relative group"
            >
                <div className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20 group-hover:opacity-0 transition-opacity" />
                {isOpen ? <X size={28} strokeWidth={1.5} /> : <MessageSquare size={28} strokeWidth={1.5} />}
            </motion.button>
        </div>
    )
}

export default ChatWidget
