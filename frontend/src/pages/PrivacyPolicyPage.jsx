import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary text-secondary">
            <div className="container mx-auto px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-4xl md:text-6xl font-serif tracking-tighter uppercase mb-6">Privacy Policy</h1>
                    <div className="w-12 h-px bg-secondary/30 mb-16"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="space-y-12 text-secondary/80 text-sm leading-relaxed">
                    <p>Last Updated: {new Date().getFullYear()}</p>
                    
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">1. Introduction</h2>
                        <p>GAURK respects your privacy and is committed to protecting your personal data. This privacy policy informs you about how we look after your personal data when you visit our website and tells you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">2. Data We Collect</h2>
                        <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul className="list-disc pl-6 space-y-2 text-secondary/60">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> includes payment card details (processed securely via third party processors).</li>
                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to process orders, manage your account, deliver relevant site content and advertisements to you, and to understand how customers use our website to improve our offerings.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. For inquiries regarding our strict data protocols, please contact Gaurkclothing@gmail.com.</p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
