import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ImageCarousel = ({ images, fallbackImage, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [images]);

    const handleNext = (e) => {
        e.stopPropagation();
        if (images && images.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }
    };

    if (!images || images.length === 0) {
        return (
            <img
                src={fallbackImage || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                    e.target.onerror = null;
                }}
            />
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden group cursor-pointer bg-secondary/5" onClick={handleNext}>
            <AnimatePresence>
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex].image_url}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                    alt={`${title} - view ${currentIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = fallbackImage || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                        e.target.onerror = null;
                    }}
                />
            </AnimatePresence>
            
            {images.length > 1 && (
                <>
                    <div className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-end px-6 md:px-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <div className="w-12 h-12 rounded-full border border-white/30 backdrop-blur-md bg-black/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-start px-6 md:px-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
                            }}
                            className="w-12 h-12 rounded-full border border-white/30 backdrop-blur-md bg-black/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-40 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                        {images.map((_, i) => (
                            <div 
                                key={i} 
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`h-1.5 rounded-full transition-all duration-700 cursor-pointer ${i === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-2.5 hover:bg-white/80'}`} 
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};


const LookbookPage = () => {
    const [lookbooks, setLookbooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLookbooks = async () => {
            try {
                const res = await api.get('/lookbooks');
                const data = res.data;

                const baseLookbooks = Array.isArray(data) ? data : (data.lookbooks || []);

                const lookbooksWithImages = await Promise.all(
                    baseLookbooks.map(async (look) => {
                        try {
                            const imgRes = await api.get(`/lookbooks/${look.id}/images`);
                            const images = imgRes.data;

                            return {
                                ...look,
                                images: Array.isArray(images) ? images : [],
                                image_url: images?.[0]?.image_url || look.image_url || null
                            };
                        } catch (e) {
                            return look;
                        }
                    })
                );

                setLookbooks(lookbooksWithImages);
            } catch (err) {
                console.error('Failed to load lookbooks', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLookbooks();
    }, []);

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen text-secondary transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="max-w-xl mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-[0.5em] text-gray-500 mb-6 block font-bold"
                    >
                        Editorial Anthology
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-serif tracking-tighter leading-none mb-8 uppercase"
                    >
                        THE <br /> LOOKBOOK
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-sm font-bold"
                    >
                        A visual exploration of form and light. Captured through the lens of modern minimalism.
                    </motion.p>
                </div>

                {isLoading ? (
                    <div className="h-96 flex items-center justify-center">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold"
                        >
                            Developing Film...
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-40">
                        {lookbooks.map((look, idx) => (
                            <motion.section
                                key={look.id}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: '-100px' }}
                                transition={{ duration: 1.5 }}
                                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}
                            >
                                <div className="w-full lg:w-3/5 overflow-hidden">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                                        className="relative aspect-[3/4] md:aspect-[16/10] bg-secondary/5 border border-secondary/5"
                                    >
                                        <ImageCarousel 
                                            images={look.images} 
                                            title={look.title} 
                                            fallbackImage={look.image_url || look.image}
                                        />
                                    </motion.div>
                                </div>

                                <div className="w-full lg:w-2/5 flex flex-col items-start lg:px-12">
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-6 block font-bold">
                                        {look.season || `Season ${new Date().getFullYear()}`}
                                    </span>
                                    <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-8 uppercase leading-tight">
                                        {look.title}
                                    </h2>
                                    {look.description && (
                                        <p className="text-gray-500 text-[10px] leading-relaxed mb-10 max-w-md uppercase tracking-widest font-bold">
                                            {look.description}
                                        </p>
                                    )}
                                    <div className="h-px w-24 bg-secondary/20 mb-10" />
                                    <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">
                                        <span>{look.images?.length || 1} {look.images?.length === 1 ? 'Look' : 'Looks'}</span>
                                        <span>Archive No. {String(idx + 1).padStart(3, '0')}</span>
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LookbookPage;
