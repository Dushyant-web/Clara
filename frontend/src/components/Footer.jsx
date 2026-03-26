import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getCategories();
                const fetchedCats = Array.isArray(data) ? data : data.categories || [];
                setCategories(fetchedCats.slice(0, 4)); // Only 4 categories max limit
            } catch (err) {
                console.error("Failed to load generic categories", err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-primary pt-24 pb-12 border-t border-secondary/5 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
                    {/* Brand Info */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 relative overflow-hidden rounded-full border border-secondary/10">
                                <img
                                    src="/assets/logo/gk_logo.png"
                                    alt="GAURK Icon"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-xl font-serif font-bold tracking-tighter brand-blue">
                                GAURK
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                            Luxury minimal crafted for the bold. Minimalist designs, high-end quality, and cinematic aesthetics.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-grayAccent transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-grayAccent transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-grayAccent transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] font-semibold mb-8">Shop</h4>
                        <ul className="flex flex-col gap-4 text-gray-400 text-sm">
                            <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            {categories.map((cat, idx) => (
                                <li key={idx}>
                                    <Link to={`/shop?cat=${cat.slug || cat.id}`} className="hover:text-white transition-colors capitalize">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] font-semibold mb-8">Support</h4>
                        <ul className="flex flex-col gap-4 text-gray-400 text-sm">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/shipping-returns" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] font-semibold mb-8">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-6">Join the elite list for early collections and exclusive access.</p>
                        <form
                            className="relative group"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const email = e.target.email.value;
                                if (!email) return;

                                const btn = e.target.querySelector('button');
                                const originalIcon = btn.innerHTML;
                                btn.disabled = true;
                                btn.innerHTML = '<span class="animate-pulse">...</span>';

                                try {
                                    const { newsletterService } = await import('../services/newsletterService');
                                    await newsletterService.subscribe(email);
                                    e.target.reset();
                                    alert('WELCOME TO THE ELITE LIST.');
                                } catch (err) {
                                    console.error('Newsletter failed', err);
                                    alert('CONNECTION ERROR. PLEASE TRY AGAIN.');
                                } finally {
                                    btn.disabled = false;
                                    btn.innerHTML = originalIcon;
                                }
                            }}
                        >
                            <input
                                type="email"
                                name="email"
                                placeholder="YOUR EMAIL"
                                className="w-full bg-transparent border-b border-secondary/20 py-3 pr-10 text-sm focus:outline-none focus:border-secondary transition-all uppercase tracking-widest text-secondary placeholder:text-secondary/20"
                                required
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
                        © 2026 GAURK LUXURY MINIMAL. ALL RIGHTS RESERVED.
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Payment Methods</span>
                        <div className="flex gap-3 opacity-40 grayscale contrast-125">
                            <span className="text-[10px] border border-secondary/20 px-1 text-secondary">VISA</span>
                            <span className="text-[10px] border border-secondary/20 px-1 text-secondary">MASTER</span>
                            <span className="text-[10px] border border-secondary/20 px-1 text-secondary">AMEX</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
