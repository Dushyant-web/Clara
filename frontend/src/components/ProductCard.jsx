import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

const ProductCard = ({ product }) => {
    const { toggleWishlist, isInWishlist, addToCart } = useCart()
    const isWishlisted = isInWishlist(product.id)

    // Using images from product data if available, or fallbacks
    const mainImage = product.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'
    const hoverImage = product.image2 || product.hover_image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=90&w=1200'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 group">
                <Link to={`/products/${product.id}`}>
                    <motion.img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                            e.target.onerror = null;
                        }}
                    />
                    {hoverImage && (
                        <img
                            src={hoverImage}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                                e.target.onerror = null;
                            }}
                        />
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="bg-secondary text-primary text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg">
                            New
                        </span>
                    )}
                    {product.onSale && (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg">
                            Sale
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-all duration-300"
                >
                    <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 bg-gradient-to-t from-black/80 to-transparent">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, null);
                        }}
                        className="w-full bg-secondary text-primary py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Quick Add <ShoppingBag size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-start text-secondary">
                <div>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-bold">{product.category || 'COLLECTION'}</h3>
                    <Link to={`/products/${product.id}`}>
                        <h2 className="text-sm font-medium tracking-tight group-hover:text-grayAccent transition-colors uppercase">{product.name}</h2>
                    </Link>
                </div>
                <p className="text-sm font-serif">₹{product.price}</p>
            </div>
        </motion.div>
    )
}

export default ProductCard
