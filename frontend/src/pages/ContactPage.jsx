import React from 'react';
import { motion } from 'framer-motion';

const ContactPage = () => {
    return (
        <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen bg-primary text-secondary">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase mb-6">Contact Us</h1>
                    <div className="w-12 h-px bg-secondary/30 mb-12"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-bold">Client Services</h2>
                        <div className="space-y-10 text-sm">
                            <div>
                                <p className="text-secondary/40 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">Email</p>
                                <a href="mailto:gaurkclothing@gmail.com" className="text-lg hover:text-gray-400 transition-colors">
                                    gaurkclothing@gmail.com
                                </a>
                            </div>
                            <div>
                                <p className="text-secondary/40 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">WhatsApp</p>
                                <a 
                                    href="https://wa.me/919217960147" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-lg hover:text-gray-400 transition-colors"
                                >
                                    +91 92179 60147
                                </a>
                            </div>
                            <div>
                                <p className="text-secondary/40 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">Hours</p>
                                <p className="text-lg hover:text-gray-400 transition-colors">24-48 Hours</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-bold">Inquiries</h2>
                        <p className="text-sm text-secondary/70 leading-relaxed mb-8">
                            For matters concerning existing orders, wholesale partnerships, press, or general inquiries, our dedicated client services team is available to assist you. Please allow 24-48 hours for a response to your inquiry.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
