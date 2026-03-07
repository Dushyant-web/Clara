import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { featuredProducts } from '../utils/mockData'

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('Newest')
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

    useEffect(() => {
        const query = searchParams.get('search')
        if (query !== null) {
            setSearchQuery(query)
        }
    }, [searchParams])

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchQuery(value)
        if (value) {
            setSearchParams({ search: value })
        } else {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete('search')
            setSearchParams(newParams)
        }
    }

    const categories = ['All', 'Hoodies', 'Bottoms', 'T-Shirts', 'Outerwear', 'Accessories']
    const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Popular']

    const filteredProducts = useMemo(() => {
        let result = [...featuredProducts] // In a real app, this would be all products

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory)
        }

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (sortBy === 'Price: Low to High') result.sort((a, b) => a.price - b.price)
        if (sortBy === 'Price: High to Low') result.sort((a, b) => b.price - a.price)

        return result
    }, [selectedCategory, sortBy, searchQuery])

    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4 text-secondary">THE SHOP</h1>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">Showing {filteredProducts.length} Premium Pieces</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center py-6 border-y border-white/5 mb-12">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-grayAccent transition-colors"
                    >
                        <Filter size={16} /> Filter
                    </button>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-6">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${selectedCategory === cat ? 'text-white' : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-grayAccent transition-colors">
                                Sort By: {sortBy} <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-20">
                                {sortOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setSortBy(option)}
                                        className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 gap-y-12 md:gap-y-16">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="text-gray-500 uppercase tracking-widest">No pieces found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Filter Sidebar Overlay */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-primary z-[70] p-12 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Filters</h2>
                                <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Categories</h3>
                                    <div className="flex flex-col gap-4">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`text-left text-xs uppercase tracking-widest hover:pl-2 transition-all ${selectedCategory === cat ? 'text-white font-bold' : 'text-gray-400'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Price Range</h3>
                                    <div className="flex flex-col gap-4">
                                        <button className="text-left text-xs uppercase tracking-widest text-gray-400 hover:text-white">Under $100</button>
                                        <button className="text-left text-xs uppercase tracking-widest text-gray-400 hover:text-white">$100 - $300</button>
                                        <button className="text-left text-xs uppercase tracking-widest text-gray-400 hover:text-white">Above $300</button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Size</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['S', 'M', 'L', 'XL'].map(size => (
                                            <button key={size} className="aspect-square border border-white/10 flex items-center justify-center text-[10px] hover:border-white transition-all">
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full mt-16 bg-white text-primary py-4 text-xs font-bold uppercase tracking-widest"
                            >
                                Apply Filters
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ShopPage
