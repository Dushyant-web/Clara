import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowLeft, Star, Share2, Info, Truck, RotateCcw, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
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
    const [reviewStats, setReviewStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [activeImage, setActiveImage] = useState(null)
    const [variantImages, setVariantImages] = useState([])
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', images: [], videos: [] })
    const [reviewFilter, setReviewFilter] = useState('all') // all | 5 | 4 | 3 | 2 | 1
    const [showPhotosOnly, setShowPhotosOnly] = useState(false)
    const [submittingReview, setSubmittingReview] = useState(false)

    // detect if current user already reviewed this product
    const userReview = reviews.find(r => r.user_id === user?.id)

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true)
            try {
                const [productData, images, related, reviewData, stats] = await Promise.all([
                    productService.getProduct(id),
                    productService.getProductImages(id),
                    productService.getRelatedProducts(id),
                    reviewService.getReviews(id, user?.id),
                    reviewService.getReviewStats(id)
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
                setReviewStats(stats || null)

                // preload user review into form for editing
                const existing = (reviewData || []).find(r => r.user_id === user?.id)
                if (existing) {
                    setReviewForm({
                        rating: existing.rating,
                        comment: existing.comment,
                        images: existing.images || [],
                        videos: existing.videos || []
                    })
                }
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
                                            fill={i < Math.floor(reviewStats?.average_rating || 0) ? "currentColor" : "none"}
                                            className={i < Math.floor(reviewStats?.average_rating || 0) ? "text-secondary" : "text-gray-600"}
                                        />
                                    ))}
                                    <span className="text-[10px] text-gray-400 ml-2 font-bold uppercase tracking-widest">({reviewStats?.total_reviews || reviews.length} Reviews)</span>
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
                <div className="mt-40 border-t border-secondary/10 pt-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:h-max">
                            <h2 className="text-4xl font-serif tracking-tight uppercase mb-12 text-secondary/90">Client Journals</h2>
                            <div className="bg-secondary/[0.02] p-12 border border-secondary/10 flex flex-col items-center justify-center text-center">
                                <div className="text-7xl font-serif mb-6 text-secondary/90">
                                    {(reviewStats?.average_rating || 0).toFixed(1)}
                                </div>
                                <div className="flex items-center gap-2 mb-8">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            fill={i < Math.floor(reviewStats?.average_rating || 0) ? "currentColor" : "none"}
                                            className={i < Math.floor(reviewStats?.average_rating || 0) ? "text-secondary/80" : "text-secondary/20"}
                                        />
                                    ))}
                                </div>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-secondary/50 font-medium">Based on {reviewStats?.total_reviews || reviews.length} shared experiences</p>
                            </div>

                            {user ? (
                                <div className="mt-16">
                                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8 text-secondary/70 border-b border-secondary/10 pb-4">
                                        {userReview ? 'Refine Your Journal' : 'Contribute a Journal'}
                                    </h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setSubmittingReview(true);
                                        if (!selectedVariant) {
                                            alert("Please select size and color before submitting your review.")
                                            setSubmittingReview(false);
                                            return;
                                        }
                                        try {
                                            if (userReview) {
                                                await reviewService.updateReview(userReview.id, {
                                                    product_id: id,
                                                    user_id: user.id,
                                                    variant_id: selectedVariant?.id,
                                                    rating: reviewForm.rating,
                                                    comment: reviewForm.comment,
                                                    images: reviewForm.images,
                                                    videos: reviewForm.videos
                                                });
                                            } else {
                                                await reviewService.createReview({
                                                    product_id: id,
                                                    user_id: user.id,
                                                    variant_id: selectedVariant?.id,
                                                    rating: reviewForm.rating,
                                                    comment: reviewForm.comment,
                                                    images: reviewForm.images,
                                                    videos: reviewForm.videos
                                                });
                                            }
                                            setReviewForm({ rating: 5, comment: '', images: [], videos: [] });
                                            const updatedReviews = await reviewService.getReviews(id, user?.id);
                                            setReviews(updatedReviews);
                                        } catch (err) {
                                            console.error('Review submission failed', err);
                                        } finally {
                                            setSubmittingReview(false);
                                        }
                                    }} className="space-y-6">
                                        <div className="flex gap-3 justify-center py-4">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star size={24} fill={star <= reviewForm.rating ? "currentColor" : "none"} className={star <= reviewForm.rating ? "text-secondary/80" : "text-secondary/20"} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="DESCRIBE YOUR PIECE EXPERIENCE..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            className="w-full bg-transparent border-b border-secondary/20 py-4 text-[11px] font-medium focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-[0.2em] min-h-[120px] placeholder:text-secondary/30 placeholder:font-normal resize-none"
                                        />
                                        {/* Media Upload Section */}
                                        <div className="space-y-6 pt-4">
                                            <p className="text-[9px] uppercase tracking-[0.3em] text-secondary/50 font-medium">
                                                Attach Visual Documentation
                                            </p>

                                            <div className="flex gap-4 flex-wrap">

                                                {/* Image Upload */}
                                                <label className="w-28 h-28 border border-secondary/20 flex flex-col gap-2 items-center justify-center text-[9px] uppercase tracking-[0.3em] cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all text-secondary/60">
                                                    <span className="text-lg font-light">+</span>
                                                    <span>Photo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        hidden
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files)
                                                            // limit to 5 images total
                                                            if (reviewForm.images.length + files.length > 5) {
                                                                alert("Maximum 5 photos allowed per review")
                                                                return
                                                            }
                                                            for (const file of files) {
                                                                const formData = new FormData()
                                                                formData.append("file", file)
                                                                formData.append("upload_preset", "clara_reviews")

                                                                const res = await fetch("https://api.cloudinary.com/v1_1/dvslo87sg/auto/upload", {
                                                                    method: "POST",
                                                                    body: formData
                                                                })

                                                                const data = await res.json()
                                                                if (data?.secure_url) {
                                                                    setReviewForm(prev => ({
                                                                        ...prev,
                                                                        images: [...prev.images, data.secure_url]
                                                                    }))
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                {/* Video Upload */}
                                                <label className="w-28 h-28 border border-secondary/20 flex flex-col gap-2 items-center justify-center text-[9px] uppercase tracking-[0.3em] cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all text-secondary/60">
                                                    <span className="text-lg font-light">+</span>
                                                    <span>Video</span>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        multiple
                                                        hidden
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files)
                                                            // allow only 1 video
                                                            if (reviewForm.videos.length + files.length > 1) {
                                                                alert("Only 1 video allowed per review")
                                                                return
                                                            }
                                                            for (const file of files) {
                                                                const formData = new FormData()
                                                                formData.append("file", file)
                                                                formData.append("upload_preset", "clara_reviews")

                                                                const res = await fetch("https://api.cloudinary.com/v1_1/dvslo87sg/auto/upload", {
                                                                    method: "POST",
                                                                    body: formData
                                                                })

                                                                const data = await res.json()
                                                                if (data?.secure_url) {
                                                                    setReviewForm(prev => ({
                                                                        ...prev,
                                                                        videos: [...prev.videos, data.secure_url]
                                                                    }))
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>

                                            </div>

                                            {/* Image Preview */}
                                            {reviewForm.images?.length > 0 && (
                                                <div className="flex gap-3 flex-wrap">
                                                    {reviewForm.images.map((img, i) => (
                                                        <div key={i} className="relative">
                                                            <img
                                                                src={img}
                                                                className="w-16 h-16 object-cover border border-secondary/20"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setReviewForm(prev => ({
                                                                        ...prev,
                                                                        images: prev.images.filter((_, idx) => idx !== i)
                                                                    }))
                                                                }
                                                                className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white/20"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Video Preview */}
                                            {reviewForm.videos?.length > 0 && (
                                                <div className="flex gap-3 flex-wrap">
                                                    {reviewForm.videos.map((vid, i) => (
                                                        <div key={i} className="relative">
                                                            <video
                                                                src={vid}
                                                                className="w-20 h-16 object-cover border border-secondary/20"
                                                                controls
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setReviewForm(prev => ({
                                                                        ...prev,
                                                                        videos: prev.videos.filter((_, idx) => idx !== i)
                                                                    }))
                                                                }
                                                                className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white/20"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            disabled={submittingReview || !reviewForm.comment.trim()}
                                            className="w-full py-5 bg-secondary text-primary text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-secondary/90 transition-all disabled:opacity-20 mt-8"
                                        >
                                            {submittingReview ? <Loader2 className="animate-spin mx-auto text-primary" size={16} /> : 'Post Entry'}
                                        </button>
                                        {userReview && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!window.confirm('Delete your review?')) return
                                                    await reviewService.deleteReview(userReview.id)
                                                    const updatedReviews = await reviewService.getReviews(id, user?.id)
                                                    setReviews(updatedReviews)
                                                }}
                                                className="w-full py-4 border border-red-500/20 text-red-400 text-[9px] font-medium uppercase tracking-[0.3em] hover:bg-red-500/5 transition-all"
                                            >
                                                Retract Entry
                                            </button>
                                        )}
                                    </form>
                                </div>
                            ) : (
                                <div className="mt-16 p-12 border border-secondary/10 bg-secondary/[0.02] text-center">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-secondary/60 mb-6 font-medium">Please identify yourself to leave a journal entry.</p>
                                    <Link to="/login" className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-secondary/30 hover:border-secondary transition-all pb-1 text-secondary/90">Identification</Link>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8">
                            <div className="flex items-center gap-6 mb-16 pb-6 border-b border-secondary/10 flex-wrap">
                                <div className="relative">
                                    <select
                                        value={reviewFilter}
                                        onChange={(e) => setReviewFilter(e.target.value)}
                                        className="appearance-none pr-8 py-2 text-[9px] bg-transparent text-secondary uppercase tracking-[0.3em] font-medium cursor-pointer focus:outline-none border-none"
                                    >
                                        <option value="all">All Chronicles</option>
                                        <option value="5">5★ Chronicles</option>
                                        <option value="4">4★ Chronicles</option>
                                        <option value="3">3★ Chronicles</option>
                                        <option value="2">2★ Chronicles</option>
                                        <option value="1">1★ Chronicles</option>
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary/50 pointer-events-none" size={14} />
                                </div>

                                <div className="relative border-l border-secondary/20 pl-6">
                                    <select
                                        value={showPhotosOnly ? "media" : "all"}
                                        onChange={(e) => setShowPhotosOnly(e.target.value === "media")}
                                        className="appearance-none pr-8 py-2 text-[9px] bg-transparent text-secondary uppercase tracking-[0.3em] font-medium cursor-pointer focus:outline-none border-none"
                                    >
                                        <option value="all">All Content</option>
                                        <option value="media">Visuals Only</option>
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary/50 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Filtered reviews variable */}
                        {/*
                          4. Improve review filtering to avoid duplicate filtering.
                        */}
                        {(() => {
                            // This IIFE is just to scope the variable for clarity
                            // In actual code, you might want to move this declaration above the return statement
                            // but per instruction, we place it here above the filtered rendering.
                            // eslint-disable-next-line
                            const filteredReviews = reviews
                                .filter(r => reviewFilter === 'all' ? true : r.rating === parseInt(reviewFilter))
                                .filter(r => showPhotosOnly ? ((r.images?.length > 0) || (r.videos?.length > 0)) : true)
                            return (
                                <div className="lg:col-span-8 space-y-12">
                                    {filteredReviews.length > 0 ? (
                                        filteredReviews.map((review, idx) => (
                                            <div key={idx} className="border-b border-secondary/10 pb-16 pt-8 first:pt-0">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-12 h-12 bg-secondary/5 rounded-full flex items-center justify-center text-[11px] font-serif uppercase border border-secondary/10 text-secondary/70">
                                                        U{idx + 1}
                                                    </div>
                                                    <div className="pt-1">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-secondary/90">
                                                            {review.verified_purchase ? (
                                                                <span className="text-secondary/70 flex items-center gap-1">
                                                                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-emerald-600/70" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                                    Verified Patron
                                                                </span>
                                                            ) : (
                                                                <span className="text-secondary/40">Digital Client</span>
                                                            )}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-secondary" : "text-gray-600"} />)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right pt-1">
                                                    <p className="text-[9px] text-secondary/40 uppercase tracking-[0.3em] font-medium mb-1 border-b border-secondary/10 pb-1 inline-block">
                                                        {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-[8px] text-secondary/30 uppercase tracking-[0.4em]">
                                                        Manifest #{idx + 1024}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pl-[68px]">
                                                <p className="text-secondary/80 text-[13px] leading-8 font-serif italic mb-6">
                                                    "{review.comment}"
                                                </p>
                                                {/* Admin Reply */}
                                                {review.replies && review.replies.length > 0 && (
                                                    <div className="mt-6 mb-6 border-l-2 border-secondary/20 pl-6 py-2 bg-secondary/[0.02]">
                                                        {review.replies.map((rep, i) => (
                                                            <div key={i} className="text-[11px] text-secondary/60 leading-relaxed uppercase tracking-wider">
                                                                <span className="font-bold text-secondary/80 mr-3 inline-block">
                                                                    — The Brand:
                                                                </span>
                                                                {rep.reply}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {(review.color || review.size) && (
                                                    <div className="flex items-center gap-3 mt-4 mb-2">
                                                        <span className="px-3 py-1 bg-secondary/5 border border-secondary/10 text-[9px] text-secondary/60 uppercase tracking-[0.2em] font-medium">
                                                            Variant Profile
                                                        </span>
                                                        <span className="text-[9px] text-secondary/40 uppercase tracking-[0.2em]">
                                                            {review.color && `Color: ${review.color}`}
                                                            {review.color && review.size && <span className="mx-2 opacity-30">/</span>}
                                                            {review.size && `Size: ${review.size}`}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {/* MEDIA GALLERY */}
                                                {(review.images?.length > 0 || review.videos?.length > 0) && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-8">
                                                        {review.images?.map((img, i) => (
                                                            <div key={`img-${i}`} className="aspect-square bg-secondary/5 border border-secondary/10 overflow-hidden group">
                                                                <img
                                                                    src={img}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] hover:grayscale-0"
                                                                />
                                                            </div>
                                                        ))}
                                                        {review.videos?.map((vid, i) => (
                                                            <div key={`vid-${i}`} className="aspect-square bg-secondary/5 border border-secondary/10 overflow-hidden">
                                                                <video
                                                                    src={vid}
                                                                    className="w-full h-full object-cover grayscale-[50%] hover:grayscale-0 transition-all duration-500"
                                                                    controls
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Helpful Vote */}
                                                <div className="mt-8 flex items-center gap-4">
                                                    <button
                                                        onClick={async () => {
                                                            if (!user) {
                                                                alert("Authentication required for network actions.")
                                                                return
                                                            }

                                                            try {
                                                                let data

                                                                // toggle vote
                                                                if (review.user_voted) {
                                                                    data = await reviewService.removeHelpfulVote(review.id, user.id)
                                                                } else {
                                                                    data = await reviewService.voteHelpful(review.id, user.id)
                                                                }

                                                                setReviews(prev =>
                                                                    prev.map(r => {
                                                                        if (r.id === review.id) {
                                                                            return {
                                                                                ...r,
                                                                                helpful_count: data.helpful_count,
                                                                                user_voted: !r.user_voted
                                                                            }
                                                                        }
                                                                        return r
                                                                    })
                                                                )
                                                            } catch (err) {
                                                                console.error("Network validation failed", err)
                                                            }
                                                        }}
                                                        className={`px-5 py-2 text-[9px] uppercase tracking-[0.3em] font-medium transition-all flex items-center gap-2 
                                                            ${review.user_voted 
                                                                ? 'bg-secondary text-primary border border-secondary' 
                                                                : 'border border-secondary/20 text-secondary/60 hover:border-secondary hover:text-secondary'}`}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill={review.user_voted ? "currentColor" : "none"} className="w-3 h-3" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        Acknowledged ({review.helpful_count || 0})
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        ))
                                    ) : (
                                        <div className="py-20 text-center border border-dashed border-secondary/10">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold italic">No archives found for this piece.</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
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
