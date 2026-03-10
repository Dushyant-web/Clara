import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const { wishlist } = useCart();

    if (wishlist.length === 0) {
        return (
            <div className="pt-40 pb-24 min-h-screen bg-primary flex flex-col items-center justify-center text-center px-6 transition-colors duration-500">
                <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mb-8 border border-secondary/10">
                    <Heart size={32} className="text-gray-500" />
                </div>
                <h1 className="text-4xl font-serif tracking-tighter mb-4 uppercase text-secondary">Your Wishlist is Empty</h1>
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-12 font-bold">Save your favorite pieces here for later.</p>
                <Link to="/shop" className="px-12 py-5 bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all">Browse Shop</Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <header className="mb-16">
                    <p className="text-[10px] tracking-[0.5em] font-bold text-gray-500 mb-4 uppercase">SAVED PIECES</p>
                    <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase">Wishlist</h1>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    <AnimatePresence>
                        {wishlist.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
