import React from 'react';
import { motion } from 'framer-motion';

const FaqPage = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary text-secondary">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase mb-6">FAQ</h1>
                    <div className="w-12 h-px bg-secondary/30 mb-16"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="space-y-12">
                    
                    <div className="border-b border-secondary/10 pb-8">
                        <h3 className="text-lg font-serif mb-4 uppercase tracking-wide">Where are your garments manufactured?</h3>
                        <p className="text-sm text-secondary/60 leading-relaxed">
                            Our garments are meticulously crafted in select facilities using high-end, premium materials sourced globally. Quality and precision are central to our design ethos.
                        </p>
                    </div>

                    <div className="border-b border-secondary/10 pb-8">
                        <h3 className="text-lg font-serif mb-4 uppercase tracking-wide">How can I track my order?</h3>
                        <p className="text-sm text-secondary/60 leading-relaxed">
                            Once your order is processed and dispatched, you will receive an automatic tracking link via email. You can also view real-time status updates through your account dashboard.
                        </p>
                    </div>

                    <div className="border-b border-secondary/10 pb-8">
                        <h3 className="text-lg font-serif mb-4 uppercase tracking-wide">Do you ship internationally?</h3>
                        <p className="text-sm text-secondary/60 leading-relaxed">
                            Yes, GAURK offers global delivery. International shipping rates and transit times vary. Please check out the cart page for an exact quote. Note that import duties and taxes may apply.
                        </p>
                    </div>

                    <div className="border-b border-secondary/10 pb-8">
                        <h3 className="text-lg font-serif mb-4 uppercase tracking-wide">What is your sizing like?</h3>
                        <p className="text-sm text-secondary/60 leading-relaxed">
                            Our silhouettes usually feature a modern, relaxed fit. We recommend ordering your true size for our intended aesthetic. Please consult our detailed sizing charts located on individual product pages.
                        </p>
                    </div>

                    <div className="border-b border-secondary/10 pb-8">
                        <h3 className="text-lg font-serif mb-4 uppercase tracking-wide">Can I change or cancel my order?</h3>
                        <p className="text-sm text-secondary/60 leading-relaxed">
                            We process orders rapidly to ensure fast delivery. If you need to modify or cancel your order, please contact Gaurkclothing@gmail.com immediately. Once dispatched, an order cannot be modified.
                        </p>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default FaqPage;
