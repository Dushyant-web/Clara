import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { collectionService } from '../services/collectionService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const CollectionPage = () => {
    const { slug } = useParams();
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectionData = async () => {
            try {
                setLoading(true);

                // Get all collections
                const data = await collectionService.getCollections();
                const baseCollections = Array.isArray(data) ? data : (data.collections || []);

                // Find current collection by slug
                const currentCollection = baseCollections.find(c => c.slug === slug);
                setCollection(currentCollection || null);

                // Fetch products in this collection
                if (currentCollection) {
                    const productData = await collectionService.getCollectionProducts(currentCollection.slug);
                    setProducts(productData || []);
                } else {
                    setProducts([]);
                }

            } catch (err) {
                console.error('Failed to load collection', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionData();
    }, [slug]);

    if (loading) return <Loader />;

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                {/* Back Button */}
                <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-secondary transition-colors mb-12 font-bold"
                >
                    <ArrowLeft size={14} /> Back to Collections
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4 block font-bold"
                        >
                            Collection Archive
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-serif tracking-tighter uppercase text-secondary"
                        >
                            {collection?.title || collection?.name || 'Collection'}
                        </motion.h1>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 border border-secondary/10 text-[10px] uppercase tracking-widest font-bold hover:bg-secondary hover:text-primary transition-all">
                        <SlidersHorizontal size={14} /> Refine
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="py-20 text-center border border-secondary/5 bg-secondary/2">
                        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No pieces found in this collection.</p>
                        <Link to="/shop" className="inline-block mt-8 text-secondary underline underline-offset-4 uppercase tracking-widest text-[10px] font-bold">
                            Explore All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionPage;
