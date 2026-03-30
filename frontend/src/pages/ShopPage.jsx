import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
    const [selectedPriceRange, setSelectedPriceRange] = useState('All')
    const [selectedSize, setSelectedSize] = useState('All')
    const [sortBy, setSortBy] = useState('Newest')
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '')
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)
const initialPageFromPath = (() => {
    const match = location.pathname.match(/\/shop\/page\/(\d+)/)
    return match ? parseInt(match[1], 10) : parseInt(searchParams.get('page') || '1', 10)
})()

const [page, setPage] = useState(initialPageFromPath)
const [totalPages, setTotalPages] = useState(1)
const [totalProducts, setTotalProducts] = useState(0)

    useEffect(() => {
        const query = searchParams.get('search') || searchParams.get('q')
        const category = searchParams.get('category')

        if (query !== null) {
            setSearchQuery(query)
        }
        if (category !== null) {
            setSelectedCategory(category)
        }
    }, [searchParams])

    useEffect(() => {
        const params = new URLSearchParams(searchParams)

        if (page === 1) {
            navigate(`/shop?${params.toString()}`, { replace: true })
        } else {
            navigate(`/shop/page/${page}?${params.toString()}`, { replace: true })
        }
    }, [page])


    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryService.getCategories()

                setCategories([
                    { name: "All", slug: "all" },
                    ...data.map(c => ({
                        name: c.name,
                        slug: c.slug
                    }))
                ])
            } catch (err) {
                console.error("Failed to load categories", err)
            }
        }

        loadCategories()
    }, [])

useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true)
        setProducts([])
        try {
            const params = {
                page,
                limit: 40
            }

            if (searchQuery && searchQuery.trim() !== '') {
                params.search = searchQuery.trim()
            }

            if (selectedCategory && selectedCategory !== 'all') {
                params.category = selectedCategory
            }

            if (selectedPriceRange === 'Under ₹1000') {
                params.max_price = 1000
            } else if (selectedPriceRange === '₹1000 - ₹3000') {
                params.min_price = 1000
                params.max_price = 3000
            } else if (selectedPriceRange === 'Above ₹3000') {
                params.min_price = 3000
            }

            if (sortBy === 'Price: Low to High') {
                params.sort = 'price_asc'
            } else if (sortBy === 'Price: High to Low') {
                params.sort = 'price_desc'
            } else {
                params.sort = 'newest'
            }

            const data = await productService.getProducts(params)

            setProducts(data?.products || [])
            setTotalPages(data?.pages || 1)
            setTotalProducts(data?.total || 0)
        } catch (err) {
            console.error('Failed to load products', err)
        } finally {
            setLoading(false)
        }
    }

    fetchProducts()
}, [selectedCategory, searchQuery, selectedPriceRange, sortBy, page])

    const [categories, setCategories] = useState([{ name: 'All', slug: 'all' }])
    const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Popular']

    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Safety category filter (prevents wrong category items showing)
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(p => {
                if (p.category_slug) return p.category_slug === selectedCategory
                if (p.category) return p.category.toLowerCase() === selectedCategory.toLowerCase()
                return true
            })
        }

        // Backend now handles category filtering, we only keep local filtering for price/size/search
        /* 
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
        }
        */

        if (selectedPriceRange !== 'All') {
            result = result.filter(p => {
                const price = parseFloat(p.price)
                if (selectedPriceRange === 'Under ₹1000') return price < 1000
                if (selectedPriceRange === '₹1000 - ₹3000') return price >= 1000 && price <= 3000
                if (selectedPriceRange === 'Above ₹3000') return price > 3000
                return true
            })
        }

        if (selectedSize !== 'All') {
            result = result.filter(p => p.sizes && p.sizes.includes(selectedSize))
        }

        // Backend already performs fuzzy + partial search.
        // Do NOT filter again on the frontend, otherwise matches like "shrt" → "shirt" get removed.

        if (sortBy === 'Newest') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }

        if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        }

        if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        }

        return result
    }, [selectedCategory, selectedPriceRange, selectedSize, sortBy, searchQuery, products])

    return (
        <div className="pt-32 pb-24 min-h-screen bg-primary transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">THE SHOP</h1>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
                            Showing {filteredProducts.length ? (page - 1) * 40 + 1 : 0}–{(page - 1) * 40 + filteredProducts.length} of {totalProducts} Premium Pieces
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center py-6 border-y border-white/5 mb-12">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-gray-400 transition-colors"
                    >
                        <Filter size={16} /> Filter
                    </button>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-6">
                            {categories.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => {
                                        setSelectedCategory(cat.slug)
                                        setPage(1)

                                        // Clear search when switching categories
                                        setSearchQuery('')

                                        const params = new URLSearchParams(searchParams)
                                        params.delete('search')
                                        params.delete('q')

                                        params.set('category', cat.slug)
                                        params.set('page', '1')

                                        setSearchParams(params)
                                    }}
                                    className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${selectedCategory === cat.slug ? 'text-secondary' : 'text-gray-500 hover:text-secondary'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-gray-400 transition-colors"
                            >
                                Sort By: {sortBy} <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isSortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-primary border border-secondary/10 p-2 z-20 shadow-2xl transition-colors duration-500"
                                        >
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option)
                                                        setIsSortOpen(false)
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-secondary/5 transition-colors ${sortBy === option ? 'text-secondary font-bold' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 gap-y-12 md:gap-y-16">
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[3/4] bg-secondary/5 border border-secondary/10"></div>
                                <div className="h-4 bg-secondary/5 w-1/2"></div>
                            </div>
                        ))
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>

                {!loading && filteredProducts.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="text-gray-500 uppercase tracking-widest">No pieces found matching your criteria.</p>
                    </div>
                )}

                <div className="flex justify-center mt-16 gap-2 text-xs uppercase tracking-widest">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-secondary/20 disabled:opacity-30"
                    >
                        Previous
                    </button>

                    {(() => {
                        const pages = []
                        const start = Math.max(1, page - 2)
                        const end = Math.min(totalPages, page + 2)

                        if (start > 1) {
                            pages.push(
                                <button
                                    key={1}
                                    onClick={() => setPage(1)}
                                    className={`px-4 py-2 border ${page === 1 ? 'border-secondary bg-secondary text-primary' : 'border-secondary/20'}`}
                                >
                                    1
                                </button>
                            )
                            if (start > 2) {
                                pages.push(<span key="start-ellipsis" className="px-2">...</span>)
                            }
                        }

                        for (let p = start; p <= end; p++) {
                            pages.push(
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-4 py-2 border ${page === p ? 'border-secondary bg-secondary text-primary' : 'border-secondary/20'}`}
                                >
                                    {p}
                                </button>
                            )
                        }

                        if (end < totalPages) {
                            if (end < totalPages - 1) {
                                pages.push(<span key="end-ellipsis" className="px-2">...</span>)
                            }
                            pages.push(
                                <button
                                    key={totalPages}
                                    onClick={() => setPage(totalPages)}
                                    className={`px-4 py-2 border ${page === totalPages ? 'border-secondary bg-secondary text-primary' : 'border-secondary/20'}`}
                                >
                                    {totalPages}
                                </button>
                            )
                        }

                        return pages
                    })()}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border border-secondary/20 disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
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
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-primary z-[70] p-6 md:p-12 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-12 text-secondary">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Filters</h2>
                                <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Categories</h3>
                                    <div className="flex flex-col gap-4">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.slug}
                                                onClick={() => {
                                                    setSelectedCategory(cat.slug)
                                                    setPage(1)

                                                    setSearchQuery('')

                                                    const params = new URLSearchParams(searchParams)
                                                    params.delete('search')
                                                    params.delete('q')

                                                    params.set('category', cat.slug)
                                                    params.set('page', '1')

                                                    setSearchParams(params)
                                                }}
                                                className={`text-left text-xs uppercase tracking-widest hover:pl-2 transition-all ${selectedCategory === cat.slug ? 'text-secondary font-bold' : 'text-gray-400'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Price Range</h3>
                                    <div className="flex flex-col gap-4">
                                        {['All', 'Under ₹1000', '₹1000 - ₹3000', 'Above ₹3000'].map(range => (
                                            <button
                                                key={range}
                                                onClick={() => setSelectedPriceRange(range)}
                                                className={`text-left text-xs uppercase tracking-widest hover:pl-2 transition-all ${selectedPriceRange === range ? 'text-secondary font-bold' : 'text-gray-400'
                                                    }`}
                                            >
                                                {range}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gray-500">Size</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['S', 'M', 'L', 'XL'].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(selectedSize === size ? 'All' : size)}
                                                className={`aspect-square border flex items-center justify-center text-[10px] transition-all ${selectedSize === size ? 'border-secondary bg-secondary text-primary' : 'border-secondary/10 text-secondary hover:border-secondary'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="sticky bottom-0 pt-12 pb-6 bg-primary mt-auto">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full bg-secondary text-primary py-4 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-gray-200 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ShopPage
