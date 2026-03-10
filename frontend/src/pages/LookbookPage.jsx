import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

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
                                        <img
                                            src={look.image_url || look.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'}
                                            alt={look.title}
                                            className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                <div className="w-full lg:w-2/5 flex flex-col items-start lg:px-12">
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-6 block font-bold">Volume {idx + 1}</span>
                                    <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-8 uppercase leading-tight">
                                        {look.title}
                                    </h2>
                                    <p className="text-gray-500 text-[10px] leading-relaxed mb-10 max-w-md uppercase tracking-widest font-bold">
                                        {look.description || "Experimental textures meeting architectural structure. A study in contemporary silhouette."}
                                    </p>
                                    <div className="h-px w-24 bg-secondary/20 mb-10" />
                                    <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">
                                        <span>Digital 35mm</span>
                                        <span>Paris, France</span>
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
