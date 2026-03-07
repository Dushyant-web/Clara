import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../hooks/useCartStore'

const ProductCard = ({ product }) => {
    const { toggleWishlist, wishlist } = useCartStore()
    const isWishlisted = wishlist.some(item => item.id === product.id)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 group">
                <Link to={`/product/${product.id}`}>
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.image2 && (
                        <img
                            src={product.image2}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        />
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="brand-blue-bg text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg">
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
                    <button className="w-full brand-blue-bg text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-secondary hover:text-primary transition-all duration-300 flex items-center justify-center gap-2">
                        Quick Add <ShoppingBag size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-start">
                <div>
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-1">{product.category}</h3>
                    <Link to={`/product/${product.id}`}>
                        <h2 className="text-sm font-medium tracking-tight group-hover:text-grayAccent transition-colors uppercase">{product.name}</h2>
                    </Link>
                </div>
                <p className="text-sm font-serif">${product.price}</p>
            </div>
        </motion.div>
    )
}

export default ProductCard
