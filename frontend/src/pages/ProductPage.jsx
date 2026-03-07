import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowLeft, Star, Share2, Info, Truck, RotateCcw } from 'lucide-react'
import { featuredProducts } from '../utils/mockData'
import { useCartStore } from '../hooks/useCartStore'
import ProductCard from '../components/ProductCard'

const ProductPage = () => {
    const { id } = useParams()
    const { addToCart, toggleWishlist, wishlist } = useCartStore()
    const product = featuredProducts.find(p => p.id === parseInt(id)) || featuredProducts[0]

    const [selectedSize, setSelectedSize] = useState('')
    const [activeImage, setActiveImage] = useState(product.image)
    const isWishlisted = wishlist.some(item => item.id === product.id)

    const sizes = ['S', 'M', 'L', 'XL', 'XXL']

    if (!product) return <div className="pt-40 text-center">Product not found</div>

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                {/* Breadcrumbs */}
                <Link to="/shop" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-12">
                    <ArrowLeft size={14} /> Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2 order-2 md:order-1 flex md:flex-col gap-4">
                            {[product.image, product.image2].filter(Boolean).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`aspect-[3/4] border ${activeImage === img ? 'border-secondary' : 'border-secondary/10'} overflow-hidden transition-all duration-300`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                        <div className="md:col-span-10 order-1 md:order-2">
                            <div className="aspect-[3/4] overflow-hidden bg-neutral-900 group relative">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={activeImage}
                                    className="w-full h-full object-cover"
                                    alt={product.name}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="mb-8">
                            <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4 block">{product.category}</span>
                            <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-4 capitalize">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <p className="text-2xl font-serif">${product.price}</p>
                                <div className="h-4 w-px bg-white/20" />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "white" : "none"} className={i < 4 ? "text-white" : "text-gray-600"} />)}
                                    <span className="text-[10px] text-gray-400 ml-2">(12 Reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-10">
                            Hand-crafted from premium weighted cotton, this piece embodies the intersection of luxury and street culture. Featuring an oversized fit and signature minimalist detailing.
                        </p>

                        {/* Sizes */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase tracking-widest font-bold">Select Size</span>
                                <button className="text-[10px] uppercase tracking-widest text-gray-500 underline underline-offset-4">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 border flex items-center justify-center text-xs transition-all ${selectedSize === size ? 'bg-white text-primary border-white' : 'border-white/10 hover:border-white'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-12">
                            <button
                                onClick={() => selectedSize && addToCart(product, selectedSize)}
                                className={`w-full py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${selectedSize
                                    ? 'bg-white text-primary hover:bg-gray-200'
                                    : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingBag size={18} /> {selectedSize ? 'Add to Cart' : 'Select a Size'}
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className="py-4 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    <Heart size={16} fill={isWishlisted ? "white" : "none"} /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                </button>
                                <button className="py-4 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>

                        {/* Info Accordion */}
                        <div className="border-t border-white/10 pt-8 space-y-6">
                            <div className="flex gap-4 items-start">
                                <Truck size={20} className="text-gray-400" />
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Shipping & Delivery</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">Free global shipping on orders above $500. Expected delivery: 3-5 business days.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <RotateCcw size={20} className="text-gray-400" />
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Returns & Exchanges</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">30-day effortless return policy. See terms for details.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-32">
                    <div className="flex justify-between items-end mb-16">
                        <h2 className="text-3xl font-serif tracking-tighter uppercase">Related Pieces</h2>
                        <Link to="/shop" className="text-[10px] uppercase tracking-widest font-bold underline underline-offset-8">Explore All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.slice(0, 4).map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage
