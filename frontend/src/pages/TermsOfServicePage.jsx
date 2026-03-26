import React from 'react';
import { motion } from 'framer-motion';

const TermsOfServicePage = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary text-secondary">
            <div className="container mx-auto px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-4xl md:text-6xl font-serif tracking-tighter uppercase mb-6">Terms of Service</h1>
                    <div className="w-12 h-px bg-secondary/30 mb-16"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="space-y-12 text-secondary/80 text-sm leading-relaxed">
                    <p>Last Updated: {new Date().getFullYear()}</p>
                    
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">1. General</h2>
                        <p>Welcome to GAURK. These Terms of Service ("Terms") govern your use of our website located at gaurk.com. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">2. Purchases</h2>
                        <p>If you wish to purchase any product made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information. We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product availability, errors in the description or price of the product, or error in your order.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">3. Intellectual Property</h2>
                        <p>The Service and its original content, features and functionality are and will remain the exclusive property of GAURK and its licensors. Our garments, designs, trademarks, logos, and imagery are protected by copyright, trademark, and other intellectual property laws.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">4. Limitation of Liability</h2>
                        <p>In no event shall GAURK, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">5. Contact</h2>
                        <p>If you have any questions about these Terms, please contact us at gaurkclothing@gmail.com.</p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
