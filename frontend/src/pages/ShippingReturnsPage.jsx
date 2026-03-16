import React from 'react';
import { motion } from 'framer-motion';

const ShippingReturnsPage = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary text-secondary">
            <div className="container mx-auto px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase mb-6">Shipping & Returns</h1>
                    <div className="w-12 h-px bg-secondary/30 mb-16"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="space-y-16 text-secondary/80 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">Shipping Policy</h2>
                        <div className="space-y-4">
                            <p>We process and dispatch all orders within 1-3 business days. Once your order has been handed over to our premium courier partners, you will receive an email containing tracking information.</p>
                            <p><strong>Domestic Shipping:</strong> Complimentary express shipping is available on all domestic orders. Delivery tyically occurs within 3-5 business days upon dispatch.</p>
                            <p><strong>International Shipping:</strong> We offer worldwide delivery. Shipping rates and transit times are calculated at checkout based on the destination. Please note that customs duties and taxes are the responsibility of the recipient.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">Returns & Exchanges</h2>
                        <div className="space-y-4">
                            <p>We maintain a rigorous standard of quality. If your purchase does not meet your expectations, we accept returns and exchanges within 14 days of delivery.</p>
                            <p>To be eligible for a return, the garment must be unworn, unwashed, and in its original condition, with all tags intact. Any items returned that are damaged or altered will not be accepted and will be sent back to the customer.</p>
                            <p>To initiate a return, please contact our client services at <strong>Gaurkclothing@gmail.com</strong> with your order number. We will provide detailed instructions and a return shipping label.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-white mb-6 font-bold">Refund Process</h2>
                        <div className="space-y-4">
                            <p>Once your return is received and inspected at our facility, we will immediately notify you of the approval or rejection of your refund. If approved, your refund will be processed seamlessly, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
};

export default ShippingReturnsPage;
