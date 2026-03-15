import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';

const SearchOverlay = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [trendingProducts, setTrendingProducts] = useState([]);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    const handleTagClick = (tag) => {
        switch (tag) {
            case 'New Arrivals':
                navigate('/shop?sort=newest');
                break;
            case 'Best Sellers':
                navigate('/shop?sort=best');
                break;
            case 'Exclusive Editorial':
                navigate('/lookbook');
                break;
            case 'About The Brand':
                navigate('/about');
                break;
            default:
                navigate(`/shop?search=${encodeURIComponent(tag)}`);
        }
        onClose();
    };


    useEffect(() => {
        if (!isOpen) return;

        const fetchTrending = async () => {
            try {
                const data = await productService.getTrendingProducts(20);
                setTrendingProducts(data.products || []);
            } catch (err) {
                console.error("Failed to load trending products", err);
            }
        };

        fetchTrending();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        }, 350);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-primary flex flex-col pt-32"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-secondary hover:rotate-90 transition-transform duration-300"
                    >
                        <X size={32} strokeWidth={1} />
                    </button>

                    <div className="container mx-auto px-6 font-sans">
                        <div className="max-w-4xl mx-auto">
                            <motion.form
                                onSubmit={handleSearch}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="relative group mb-16"
                            >
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-secondary transition-colors" size={32} strokeWidth={1} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search GAURK..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-secondary py-6 pl-14 text-2xl md:text-5xl font-serif tracking-tight focus:outline-none transition-all placeholder:text-secondary/20 text-secondary"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary group-hover:translate-x-2 transition-transform"
                                >
                                    <ArrowRight size={32} strokeWidth={1} />
                                </button>
                            </motion.form>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-secondary/40 mb-8 font-bold flex items-center gap-3">
                                        Trending Now
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {trendingProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => {
                                                    navigate(`/product/${product.id}`);
                                                    onClose();
                                                }}
                                                className="px-6 py-3 bg-secondary/5 hover:bg-secondary text-secondary hover:text-primary text-[10px] uppercase tracking-widest font-bold transition-all border border-secondary/10 rounded-full"
                                            >
                                                {product.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-secondary/40 mb-8 font-bold">Quick Suggestions</h4>
                                    <div className="space-y-4">
                                        {['New Arrivals', 'Best Sellers', 'Exclusive Editorial', 'About The Brand'].map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => handleTagClick(item)}
                                                className="block text-xl md:text-2xl font-serif hover:pl-4 text-secondary hover:text-secondary/60 transition-all duration-300"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
