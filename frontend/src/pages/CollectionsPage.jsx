import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CollectionsPage = () => {
    const [collections, setCollections] = useState([])

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch('https://clara-xpfh.onrender.com/collections')
                const data = await res.json()

                const baseCollections = Array.isArray(data) ? data : (data.collections || [])
                setCollections(baseCollections)
            } catch (err) {
                console.error('Failed to load collections', err)
            }
        }

        fetchCollections()
    }, [])

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                <div className="max-w-xl mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-[0.5em] text-gray-500 mb-6 block"
                    >
                        Explore Lineage
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif tracking-tighter text-secondary leading-none mb-8"
                    >
                        THE <br /> COLLECTIONS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-sm uppercase tracking-widest leading-relaxed max-w-sm"
                    >
                        Each collection is a study in form, function, and the beauty of restraint.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {collections.map((collection, idx) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                        >
                            <Link to={`/shop?category=${collection.category}`} className="group block">
                                <div className="relative aspect-[4/5] overflow-hidden mb-8 border border-white/5">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                                        src={collection.image}
                                        alt={collection.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-serif tracking-tight text-secondary group-hover:text-grayAccent transition-colors mb-2">
                                            {collection.title}
                                        </h2>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs">
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
            </div>
        </div>
    )
}

export default CollectionsPage
