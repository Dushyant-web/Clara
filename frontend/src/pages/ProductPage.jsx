import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowLeft, Star, Share2, Info, Truck, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { productService } from '../services/productService'
import { reviewService } from '../services/reviewService'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import ProductCard from '../components/ProductCard'

const ProductPage = () => {
    const { id } = useParams()
    const { addToCart, toggleWishlist, isInWishlist } = useCart()
    const { user } = useAuth()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [activeImage, setActiveImage] = useState(null)
    const [variantImages, setVariantImages] = useState([])
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true)
            try {
                const [productData, images, related, reviewData] = await Promise.all([
                    productService.getProduct(id),
                    productService.getProductImages(id),
                    productService.getRelatedProducts(id),
                    reviewService.getReviews(id)
                ])

                const mainImg = images?.main_image || productData.image

                const galleryImages = [
                    images?.main_image,
                    images?.hover_image,
                    ...(Array.isArray(images?.gallery) ? images.gallery : [])
                ].filter(Boolean)

                setProduct({
                    ...productData,
                    images: galleryImages.length ? galleryImages : [productData.image],
                })

                setActiveImage(mainImg)
                setRelatedProducts(related)
                setReviews(reviewData || [])
            } catch (err) {
                console.error('Failed to fetch product details', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProductDetails()
        window.scrollTo(0, 0)
    }, [id])

    const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const isWishlisted = product ? isInWishlist(product.id) : false;

    // Check availability for each size
    const sizeAvailability = allSizes.map(size => {
        const variant = product?.variants?.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
        return {
            size,
            isAvailable: !!variant && variant.stock > 0,
            variantId: variant?.id
        };
    });

    const selectedVariant = product?.variants?.find(v =>
        (selectedColor ? v.color === selectedColor : true) &&
        (selectedSize ? v.size === selectedSize : true)
    );

    // Find a representative variant for the selected color (for images)
    const colorVariant = product?.variants?.find(v =>
        selectedColor ? v.color === selectedColor : true
    );

    // Auto select first color when product loads
    useEffect(() => {
        if (!product?.variants || selectedColor) return;

        const firstColor = product.variants.find(v => v.color)?.color;
        if (firstColor) {
            setSelectedColor(firstColor);
        }
    }, [product]);

    // Auto select first available size when color changes
    useEffect(() => {
        if (!product?.variants || !selectedColor) return;

        const firstAvailable = product.variants.find(
            v => v.color === selectedColor && v.stock > 0
        );

        if (firstAvailable) {
            setSelectedSize(firstAvailable.size);
        }
    }, [selectedColor, product]);

    useEffect(() => {
        if (!product) return;

        // Find all images for the selected color
        if (selectedColor && product.variants) {
            const colorImages = product.variants
                .filter(v => v.color === selectedColor)
                .flatMap(v => {
                    // New structure: images = { main, hover, gallery[] }
                    if (v.images && typeof v.images === "object") {
                        const imgs = [
                            v.images.main,
                            v.images.hover,
                            ...(Array.isArray(v.images.gallery) ? v.images.gallery : [])
                        ].filter(Boolean);

                        // remove duplicate image URLs
                        return [...new Set(imgs)];
                    }

                    // Old fallback structure
                    if (v.image_url) {
                        return [v.image_url];
                    }

                    return [];
                });

            if (colorImages.length) {
                setVariantImages(colorImages);
                setActiveImage(colorImages[0]);
                return;
            }
        }

        // fallback to product gallery
        if (product.images?.length) {
            setVariantImages(product.images);
            setActiveImage(product.images[0]);
        }
    }, [selectedColor, product]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-primary"><p className="text-[10px] tracking-[0.5em] animate-pulse text-secondary">LOADING...</p></div>
    if (!product) return <div className="h-screen flex items-center justify-center bg-primary text-secondary uppercase tracking-widest">Product not found.</div>

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                {/* Breadcrumbs */}
                <Link to="/shop" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-secondary transition-colors mb-12 font-bold">
                    <ArrowLeft size={14} /> Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2 order-2 md:order-1 flex md:flex-col gap-4">
                            {(variantImages.length ? variantImages : product.images).filter(Boolean).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`aspect-[3/4] border ${activeImage === img ? 'border-secondary' : 'border-secondary/10'} overflow-hidden transition-all duration-300 bg-secondary/5`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                        <div className="md:col-span-10 order-1 md:order-2">
                            <div className="aspect-[3/4] overflow-hidden bg-secondary/5 group relative">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        src={activeImage || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'}
                                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                                        className="w-full h-full object-cover"
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200';
                                            e.target.onerror = null;
                                        }}
                                    />
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                {(variantImages.length ? variantImages : product.images).length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const gallery = variantImages.length ? variantImages : product.images;
                                                const idx = gallery.indexOf(activeImage);
                                                const prevIdx = (idx - 1 + gallery.length) % gallery.length;
                                                setActiveImage(gallery[prevIdx]);
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-primary/20 backdrop-blur-md text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/40 rounded-full"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const gallery = variantImages.length ? variantImages : product.images;
                                                const idx = gallery.indexOf(activeImage);
                                                const nextIdx = (idx + 1) % gallery.length;
                                                setActiveImage(gallery[nextIdx]);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary/20 backdrop-blur-md text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/40 rounded-full"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="mb-8">
                            <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4 block font-bold">{product.category || 'Luxury Base'}</span>
                            <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-4 capitalize">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <p className="text-2xl font-serif">
                                    ₹{selectedVariant?.price ?? product.price}
                                </p>
                                <div className="h-4 w-px bg-secondary/20" />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"}
                                            className={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "text-secondary" : "text-gray-600"}
                                        />
                                    ))}
                                    <span className="text-[10px] text-gray-400 ml-2 font-bold uppercase tracking-widest">({reviews.length} Reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-10 tracking-wide">
                            {product.description || 'Hand-crafted from premium weighted cotton, this piece embodies the intersection of luxury and street culture. Featuring an oversized fit and signature minimalist detailing.'}
                        </p>

                        {/* Colors */}
                        <div className="mb-10">
                          <span className="text-[10px] uppercase tracking-widest font-bold mb-4 block">Select Color</span>

                          {product?.variants && (
                            <div className="flex gap-3 flex-wrap">
                              {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map(color => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    setSelectedColor(color)
                                    setSelectedSize('')
                                  }}
                                  className={`px-4 py-3 border text-[10px] uppercase tracking-widest font-bold transition-all ${selectedColor === color
                                    ? 'bg-secondary text-primary border-secondary'
                                    : 'border-secondary/10 hover:border-secondary text-secondary'
                                  }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Sizes */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase tracking-widest font-bold">Select Size</span>
                                <button className="text-[10px] uppercase tracking-widest text-gray-500 underline underline-offset-4 font-bold">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {sizeAvailability.map(({ size, isAvailable, variantId }) => (
                                    <button
                                        key={size}
                                        disabled={!isAvailable}
                                        onClick={() => isAvailable && setSelectedSize(size)}
                                        className={`h-12 border flex items-center justify-center text-xs transition-all relative overflow-hidden ${selectedSize === size
                                            ? 'bg-secondary text-primary border-secondary font-bold'
                                            : isAvailable
                                                ? 'border-secondary/10 hover:border-secondary text-secondary'
                                                : 'border-secondary/30 text-gray-500 cursor-not-allowed opacity-60'
                                            }`}
                                    >
                                        <span className="relative z-10">{size}</span>
                                        {!isAvailable && (
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="0.5" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-12">
                            <button
                                onClick={() => {
                                    if (!selectedSize || !selectedVariant) return;

                                    // attach the correct variant image to the product before sending to cart
                                    const productWithVariantImage = {
                                        ...product,
                                        image: selectedVariant.image_url || activeImage || product.image,
                                        variant_image: selectedVariant.image_url || activeImage || product.image
                                    };

                                    addToCart(productWithVariantImage, selectedVariant.id);
                                }}
                                className={`w-full py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${selectedSize
                                    ? 'bg-secondary text-primary hover:bg-gray-200'
                                    : 'bg-secondary/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingBag size={18} /> {selectedSize ? 'Add to Cart' : 'Select a Size'}
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className="py-4 border border-secondary/10 hover:border-secondary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                </button>
                                <button className="py-4 border border-secondary/10 hover:border-secondary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>

                        {/* Info Accordion */}
                        <div className="border-t border-secondary/10 pt-8 space-y-6">
                            <div className="flex gap-4 items-start">
                                <Truck size={20} className="text-gray-500" />
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Shipping & Delivery</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">Free global shipping on orders above ₹500. Expected delivery: 3-5 business days.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <RotateCcw size={20} className="text-gray-500" />
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Returns & Exchanges</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">30-day effortless return policy. See terms for details.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-32 border-t border-secondary/5 pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-4">
                            <h2 className="text-3xl font-serif tracking-tighter uppercase mb-8">Client Journals</h2>
                            <div className="bg-secondary/5 p-10 border border-secondary/10">
                                <div className="text-5xl font-serif mb-4">
                                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"}
                                            className={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "text-secondary" : "text-gray-600"}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Based on {reviews.length} shared experiences</p>
                            </div>

                            {user ? (
                                <div className="mt-12">
                                    <h3 className="text-xs uppercase tracking-widest font-black mb-6">Submit Your Journal</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setSubmittingReview(true);
                                        try {
                                            await reviewService.createReview({
                                                product_id: id,
                                                user_id: user.id,
                                                rating: reviewForm.rating,
                                                comment: reviewForm.comment
                                            });
                                            setReviewForm({ rating: 5, comment: '' });
                                            const updatedReviews = await reviewService.getReviews(id);
                                            setReviews(updatedReviews);
                                        } catch (err) {
                                            console.error('Review submission failed', err);
                                        } finally {
                                            setSubmittingReview(false);
                                        }
                                    }} className="space-y-6">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star size={20} fill={star <= reviewForm.rating ? "currentColor" : "none"} className={star <= reviewForm.rating ? "text-secondary" : "text-gray-600"} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="DESCRIBE YOUR PIECE EXPERIENCE..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest min-h-[100px]"
                                        />
                                        <button
                                            disabled={submittingReview || !reviewForm.comment.trim()}
                                            className="w-full py-4 bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all disabled:opacity-20"
                                        >
                                            {submittingReview ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Post Entry'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="mt-12 p-8 border border-secondary/10 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-6 font-bold">Please identify yourself to leave a journal entry.</p>
                                    <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-secondary">Identfication</Link>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8 space-y-12">
                            {reviews.length > 0 ? (
                                reviews.map((review, idx) => (
                                    <div key={idx} className="border-b border-secondary/5 pb-12">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-[10px] font-serif uppercase">
                                                    U{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest">Verified Client</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-secondary" : "text-gray-600"} />)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Archive Ref: #{idx + 1024}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed uppercase tracking-widest font-medium">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center border border-dashed border-secondary/10">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold italic">No archives found for this piece.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32 border-t border-secondary/5 pt-24">
                        <div className="flex justify-between items-end mb-16">
                            <h2 className="text-3xl font-serif tracking-tighter uppercase">Related Pieces</h2>
                            <Link to="/shop" className="text-[10px] uppercase tracking-widest font-bold underline underline-offset-8">Explore All</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
                            {relatedProducts.slice(0, 4).map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductPage
