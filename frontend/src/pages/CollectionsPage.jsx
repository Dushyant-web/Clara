import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { collectionService } from '../services/collectionService'

const CollectionsPage = () => {
    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await collectionService.getCollections()
                setCollections(Array.isArray(data) ? data : (data.collections || []))
            } catch (err) {
                console.error('Failed to load collections', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCollections()
    }, [])

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <div className="max-w-xl mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-[0.5em] text-gray-500 mb-6 block font-bold"
                    >
                        Explore Lineage
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif tracking-tighter leading-none mb-8 uppercase"
                    >
                        THE <br /> COLLECTIONS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-sm font-bold"
                    >
                        Each collection is a study in form, function, and the beauty of restraint.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        <div className="aspect-[4/5] bg-secondary/5 animate-pulse" />
                        <div className="aspect-[4/5] bg-secondary/5 animate-pulse" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        {collections.map((collection, idx) => (
                            <motion.div
                                key={collection.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                            >
                                <Link to={`/shop?category=${collection.category || collection.name}`} className="group block">
                                    <div className="relative aspect-[4/5] overflow-hidden mb-8 border border-secondary/5 bg-secondary/5">
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                                            src={collection.image}
                                            alt={collection.title || collection.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-serif tracking-tight text-secondary group-hover:opacity-70 transition-all mb-2 uppercase">
                                                {collection.title || collection.name}
                                            </h2>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs font-bold">
                                                {collection.description}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all duration-500">
                                            <ArrowRight size={20} strokeWidth={1} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CollectionsPage
