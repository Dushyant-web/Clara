import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Upload,
    Image as ImageIcon,
    Check,
    ChevronRight,
    Loader2,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // info, variants, images
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category_id: 1,
        price: '',
        description: '',
        main_image: '',
        hover_image: '',
        variants: [],
        images: []
    });

    const fileInputRef = useRef(null);
    const [variantUploadIndex, setVariantUploadIndex] = useState(null);
    const [uploadSlot, setUploadSlot] = useState(null); // main | hover | gallery
    const [dragImageIndex, setDragImageIndex] = useState(null);
    const [dragColor, setDragColor] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts({ status: 'all' });
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await adminService.getCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const handleOpenModal = async (product = null) => {
        if (product) {
            setLoading(true);
            try {
                // Fetch full product details including variants and all images
                const fullProduct = await productService.getProduct(product.id);
                let productImages = [];
                try {
                    const imgRes = await productService.getProductImages(product.id);

                    // Ensure we always work with an array
                    const imgArray = Array.isArray(imgRes)
                        ? imgRes
                        : imgRes?.images || [];

                    // Standardize format for modal
                    productImages = imgArray.map(img => ({
                        image_url: img.image_url
                    }));

                } catch (e) {
                    console.error("Failed to load product images", e);
                }

                setEditingProduct(fullProduct);
                setFormData({
                    name: fullProduct.name,
                    category_id: fullProduct.category_id || 1,
                    price: fullProduct.price || '',
                    description: fullProduct.description || '',
                    main_image: fullProduct.main_image || '',
                    hover_image: fullProduct.hover_image || '',
                    variants: (fullProduct.variants || []).map(v => {
                        let imagesArray = [];

                        // Backend may send images as { main, hover, gallery: [] }
                        if (v.images && typeof v.images === "object" && !Array.isArray(v.images)) {
                            if (v.images.main) imagesArray.push({ image_url: v.images.main });
                            if (v.images.hover) imagesArray.push({ image_url: v.images.hover });

                            if (Array.isArray(v.images.gallery)) {
                                imagesArray.push(
                                    ...v.images.gallery.map(url => ({ image_url: url }))
                                );
                            }
                        } else if (Array.isArray(v.images)) {
                            imagesArray = v.images;
                        }

                        return {
                            ...v,
                            images: imagesArray
                        };
                    }),
                    images: productImages
                });
            } catch (err) {
                console.error('Failed to fetch full product details', err);
            } finally {
                setLoading(false);
            }
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category_id: 1,
                price: '',
                description: '',
                main_image: '',
                hover_image: '',
                variants: [{ size: '', color: '', price: '', stock: '', sku: '' }],
                images: []
            });
        }
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSubmitting(true);

        try {
            const { url } = await adminService.uploadImage(file);

            // Product images (main / hover)
            if (activeTab === 'info') {
                if (uploadSlot === "product_main") {
                    setFormData(prev => ({ ...prev, main_image: url }));
                } else if (uploadSlot === "product_hover") {
                    setFormData(prev => ({ ...prev, hover_image: url }));
                } else {
                    // fallback
                    setFormData(prev => ({ ...prev, main_image: url }));
                }
            }

            // Product gallery images: now upload directly to the variant
            else if (activeTab === 'images' && variantUploadIndex !== null) {
                setFormData(prev => {
                    const updated = [...prev.variants];
                    const existingImages = updated[variantUploadIndex].images || [];

                    let newImages = [...existingImages];

                    if (uploadSlot === "main") {
                        newImages[0] = { image_url: url };
                    } else if (uploadSlot === "hover") {
                        newImages[1] = { image_url: url };
                    } else {
                        newImages.push({ image_url: url });
                    }

                    updated[variantUploadIndex].images = newImages;

                    return { ...prev, variants: updated };
                });
            }

            // Variant specific images
            else if (activeTab === 'variants' && variantUploadIndex !== null) {
                setFormData(prev => {
                    const updated = [...prev.variants];

                    const existingImages = updated[variantUploadIndex].images || [];

                    updated[variantUploadIndex].images = [
                        ...existingImages,
                        { image_url: url }
                    ];

                    // also set primary variant image for backend
                    updated[variantUploadIndex].image_url = url;

                    return { ...prev, variants: updated };
                });
            }

        } catch (err) {
            alert('UPLOAD FAILED.');
        } finally {
            setIsSubmitting(false);
            setVariantUploadIndex(null);
            setUploadSlot(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let productId = editingProduct?.id;

            // 1. Save main product info
            const productPayload = {
                name: formData.name,
                description: formData.description,
                category_id: parseInt(formData.category_id),
                main_image: formData.main_image,
                hover_image: formData.hover_image,
                price: formData.price ? parseInt(formData.price) : 0
            };

            if (editingProduct) {
                await adminService.updateProduct(productId, productPayload);
            } else {
                const newProduct = await adminService.createProduct(productPayload);
                productId = newProduct.id;
            }

            // 2. Save variants
            for (const v of formData.variants) {
                const variantPayload = {
                    size: v.size,
                    color: v.color,
                    price: v.price
                        ? parseInt(v.price)
                        : (formData.price ? parseInt(formData.price) : 0),
                    stock: v.stock ? parseInt(v.stock) : 0,
                    image_url: v.image_url || formData.main_image,
                    sku:
                        v.sku ||
                        `${formData.name}-${v.color || "GEN"}-${v.size || "STD"}`
                            .toUpperCase()
                            .replace(/\s+/g, '-')
                };

                if (v.id) {
                    await adminService.updateVariantFull(v.id, variantPayload);
                } else if (v.size && v.color) {
                    const newVariant = await adminService.createVariant(productId, variantPayload);
                    v.id = newVariant.id;
                }
            }

            // 3. Save variant images (new architecture: images belong to variants)
            for (const v of formData.variants) {
                if (!v.id) continue;

                // remove existing images first to avoid duplication
                try {
                    await adminService.deleteVariantImages(v.id);
                } catch (e) {
                    console.warn("No previous images to delete");
                }

                // clean images list: remove duplicates, invalid entries, and limit count
                const images = [...new Map(
                    (v.images || [])
                        .filter(img => img && img.image_url)
                        .map(img => [img.image_url, img])
                ).values()].slice(0, 10);

                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    if (!img?.image_url) continue;

                    let imageType = "gallery";

                    if (i === 0) imageType = "main";
                    else if (i === 1) imageType = "hover";

                    await adminService.addVariantImage({
                        variant_id: v.id,
                        image_url: img.image_url,
                        type: imageType,
                        position: i
                    });
                }
            }

            alert('ARCHIVE SYNCHRONIZED.');
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error('Submission failed', err);
            alert('CRITICAL FAILURE: DATA NOT PERSISTED.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                { size: '', color: '', price: '', stock: '', sku: '', images: [] }
            ]
        }));
    };
    const removeVariant = async (index) => {
        const variant = formData.variants[index];

        if (!window.confirm("REMOVE THIS VARIANT FROM INVENTORY?")) return;

        try {
            if (variant?.id) {
                await adminService.deleteVariant(variant.id);
            }

            setFormData(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index)
            }));
        } catch (err) {
            console.error("Variant delete failed", err);
            alert("FAILED TO DELETE VARIANT");
        }
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Vault Inventory</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage archives, inventory, and premium stock</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                >
                    <Plus size={16} /> Add New Piece
                </button>
            </div>

            {/* List */}
            <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Piece</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Category</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 text-center">Variants</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 text-center">Status</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !isModalOpen ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-white/5">
                                    <td colSpan={4} className="p-8 h-20 bg-white/2" />
                                </tr>
                            ))
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 group transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-neutral-900 overflow-hidden border border-white/5">
                                                <img
                                                    src={p.main_image || p.hover_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'}
                                                    className="w-full h-full object-cover"
                                                    alt={p.name}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-black">{p.name}</p>
                                                <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">ID: {p.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                            {p.category?.name || categories.find(c => c.id === p.category_id)?.name || 'GENERAL'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {p.variants?.length || 0}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        {(() => {
                                            const active = p.is_active !== false; // treat undefined/null as active

                                            return (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await adminService.updateProduct(p.id, { is_active: !active });
                                                            fetchProducts();
                                                        } catch (e) {
                                                            console.error("Status toggle failed", e);
                                                        }
                                                    }}
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                                        active ? "bg-emerald-500" : "bg-red-500/40"
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                            active ? "translate-x-6" : ""
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(p);
                                                }} 
                                                className="p-2 border border-white/5 hover:border-white transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`PERMANENTLY ARCHIVE "${p.name?.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) {
                                                        adminService.deleteProduct(p.id).then(fetchProducts);
                                                    }
                                                }} 
                                                className="p-2 border border-white/5 hover:border-red-500 text-red-500/70 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/50">
                                <h2 className="text-xl font-black uppercase tracking-tighter">
                                    {editingProduct ? `Modify Piece: # ${editingProduct.id}` : 'Archive New Piece'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-white/5">
                                {['info', 'variants', 'images'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                <form id="inventory-form" onSubmit={handleSubmit} className="space-y-12">
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Designation</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                                        placeholder="STREETWEAR TEE"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">
                                                        Base Price (INR)
                                                    </label>

                                                    <input
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, price: e.target.value })
                                                        }
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                                        placeholder="1999"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Category Selection</label>
                                                    <select
                                                        value={formData.category_id}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'NEW') {
                                                                setIsCategoryModalOpen(true);
                                                            } else {
                                                                setFormData({ ...formData, category_id: e.target.value });
                                                            }
                                                        }}
                                                        className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all appearance-none uppercase tracking-widest text-white"
                                                        required
                                                    >
                                                        <option value="">SELECT CATEGORY</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name?.toUpperCase()}</option>
                                                        ))}
                                                        <option value="NEW" className="text-emerald-500">+ ADD NEW CATEGORY</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Primary Visual (URL or Upload)</label>
                                                <div className="grid grid-cols-2 gap-6">

                                                    {/* MAIN PRODUCT IMAGE */}
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] uppercase tracking-widest text-gray-500">Main Image</p>

                                                        <div
                                                            onClick={() => {
                                                                setUploadSlot("product_main");
                                                                fileInputRef.current.click();
                                                            }}
                                                            className="aspect-square border border-white/10 bg-neutral-900 flex items-center justify-center cursor-pointer relative group"
                                                        >
                                                            {formData.main_image ? (
                                                                <>
                                                                    <img src={formData.main_image} className="w-full h-full object-cover" />

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFormData(prev => ({ ...prev, main_image: '' }));
                                                                            if (editingProduct?.id) {
                                                                                adminService.updateProduct(editingProduct.id, { main_image: null });
                                                                            }
                                                                        }}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-[8px] text-gray-500 uppercase">Upload</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* HOVER PRODUCT IMAGE */}
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] uppercase tracking-widest text-gray-500">Hover Image</p>

                                                        <div
                                                            onClick={() => {
                                                                setUploadSlot("product_hover");
                                                                fileInputRef.current.click();
                                                            }}
                                                            className="aspect-square border border-white/10 bg-neutral-900 flex items-center justify-center cursor-pointer relative group"
                                                        >
                                                            {formData.hover_image ? (
                                                                <>
                                                                    <img src={formData.hover_image} className="w-full h-full object-cover" />

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFormData(prev => ({ ...prev, hover_image: '' }));
                                                                            if (editingProduct?.id) {
                                                                                adminService.updateProduct(editingProduct.id, { hover_image: null });
                                                                            }
                                                                        }}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-[8px] text-gray-500 uppercase">Upload</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Archive Description</label>
                                                <textarea
                                                    rows={6}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 p-6 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase leading-relaxed"
                                                    placeholder="A PREMIUM STATEMENT PIECE CRAFTED FROM..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'variants' && (
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory Variants</h3>
                                                <button
                                                    type="button"
                                                    onClick={addVariant}
                                                    className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-white hover:text-gray-400 transition-colors"
                                                >
                                                    <Plus size={12} /> Add Variant
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.variants.map((v, i) => (
                                                    <div key={i} className="grid grid-cols-7 gap-4 p-6 bg-white/[0.03] border border-white/5 items-end group/item">
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">Size</label>
                                                            <input
                                                                type="text"
                                                                value={v.size}
                                                                onChange={(e) => updateVariant(i, 'size', e.target.value)}
                                                                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] font-bold focus:border-white outline-none"
                                                                placeholder="M"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">Color</label>
                                                            <input
                                                                type="text"
                                                                value={v.color}
                                                                onChange={(e) => updateVariant(i, 'color', e.target.value)}
                                                                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] font-bold focus:border-white outline-none"
                                                                placeholder="BLACK"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">Price (INR)</label>
                                                        <input
                                                            type="number"
                                                            value={v.price}
                                                            onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                                            className="w-full bg-black/50 border border-white/10 p-3 text-[10px] font-bold focus:border-white outline-none"
                                                            placeholder={`Default ${formData.price || 0}`}
                                                        />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">Stock</label>
                                                            <input
                                                                type="number"
                                                                value={v.stock}
                                                                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                                                                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] font-bold focus:border-white outline-none"
                                                                placeholder="50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">SKU</label>
                                                            <input
                                                                type="text"
                                                                value={v.sku}
                                                                onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                                                                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] font-bold focus:border-white outline-none"
                                                                placeholder="TEE-BLK-M"
                                                            />
                                                        </div>
                                                        {/* Image upload block for variant */}
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] uppercase tracking-widest font-black text-gray-600">Images</label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setVariantUploadIndex(i);
                                                                        fileInputRef.current.click();
                                                                    }}
                                                                    className="px-3 py-2 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest"
                                                                >
                                                                    Upload
                                                                </button>
                                                                <span className="text-[9px] text-gray-400">
                                                                    {v.images?.length || 0} imgs
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(i)}
                                                            className="p-3 text-red-500/30 hover:text-red-500 transition-colors mb-0.5"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'images' && (
                                        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">

                                            {[...new Set(formData.variants.map(v => v.color))].map((color) => {

                                                const colorVariants = formData.variants.filter(v => v.color === color);

                                                const imageMap = new Map();

                                                colorVariants.forEach(v => {
                                                    if (v.image_url) {
                                                        imageMap.set(v.image_url, { image_url: v.image_url });
                                                    }

                                                    (v.images || []).forEach(img => {
                                                        if (img?.image_url) {
                                                            imageMap.set(img.image_url, { image_url: img.image_url });
                                                        }
                                                    });
                                                });

                                                const images = Array.from(imageMap.values());

                                                const mainImage = images[0];
                                                const hoverImage = images[1];
                                                const galleryImages = images.slice(2, 10);

                                                return (
                                                    <div key={color} className="space-y-6 border border-white/5 p-6 bg-white/[0.02]">

                                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                            Color {color || "UNKNOWN"}
                                                        </h3>

                                                        {/* MAIN + HOVER */}
                                                        <div className="grid grid-cols-2 gap-6">

                                                            {/* MAIN IMAGE */}
                                                            <div className="space-y-2">
                                                                <p className="text-[8px] uppercase tracking-widest text-gray-500">Main Image</p>

                                                                <div
                                                                    onClick={() => {
                                                                        const variantIndex = formData.variants.findIndex(v => v.color === color);
                                                                        setVariantUploadIndex(variantIndex);
                                                                        setUploadSlot("main");
                                                                        fileInputRef.current.click();
                                                                        // stay on images tab so upload is treated as main image
                                                                    }}
                                                                    className="aspect-square border border-white/10 bg-neutral-900 flex items-center justify-center cursor-pointer"
                                                                >
                                                                    {mainImage ? (
                                                                        <img src={mainImage.image_url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-[8px] text-gray-500 uppercase">Upload</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* HOVER IMAGE */}
                                                            <div className="space-y-2">
                                                                <p className="text-[8px] uppercase tracking-widest text-gray-500">Hover Image</p>

                                                                <div
                                                                    onClick={() => {
                                                                        const variantIndex = formData.variants.findIndex(v => v.color === color);
                                                                        setVariantUploadIndex(variantIndex);
                                                                        setUploadSlot("hover");
                                                                        fileInputRef.current.click();
                                                                        // stay on images tab so upload is treated as hover image
                                                                    }}
                                                                    className="aspect-square border border-white/10 bg-neutral-900 flex items-center justify-center cursor-pointer"
                                                                >
                                                                    {hoverImage ? (
                                                                        <img src={hoverImage.image_url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-[8px] text-gray-500 uppercase">Upload</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>

                                                        {/* GALLERY */}
                                                        <div className="space-y-3">
                                                            <p className="text-[8px] uppercase tracking-widest text-gray-500">
                                                                Gallery Images (max 10)
                                                            </p>

                                                            <div className="grid grid-cols-6 gap-4">

                                                                {galleryImages.map((img, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        draggable
                                                                        onDragStart={() => {
                                                                            setDragImageIndex(idx);
                                                                            setDragColor(color);
                                                                        }}
                                                                        onDragOver={(e) => e.preventDefault()}
                                                                        onDrop={() => {
                                                                            if (dragImageIndex === null || dragColor !== color) return;

                                                                            const reordered = [...galleryImages];
                                                                            const dragged = reordered[dragImageIndex];
                                                                            reordered.splice(dragImageIndex, 1);
                                                                            reordered.splice(idx, 0, dragged);

                                                                            const newVariants = [...formData.variants];

                                                                            newVariants.forEach(v => {
                                                                                if (v.color === color) {
                                                                                    v.images = reordered.map((imgObj, pos) => ({
                                                                                        ...imgObj,
                                                                                        position: pos
                                                                                    }));
                                                                                }
                                                                            });

                                                                            setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                            setDragImageIndex(null);
                                                                            setDragColor(null);
                                                                        }}
                                                                        className="aspect-square relative group bg-neutral-900 border border-white/5 cursor-move"
                                                                    >

                                                                        <img
                                                                            src={img.image_url}
                                                                            className="w-full h-full object-cover"
                                                                        />

                                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={async () => {

                                                                                    const newVariants = [...formData.variants];

                                                                                    newVariants.forEach(v => {
                                                                                        if (v.color === color && v.images) {
                                                                                            v.images = v.images.filter(i => i.image_url !== img.image_url);
                                                                                        }
                                                                                    });

                                                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                                }}
                                                                                className="p-2 bg-red-500 text-white rounded-full"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>

                                                                    </div>
                                                                ))}

                                                                {/* UPLOAD TILE */}
                                                                {galleryImages.length < 10 && (
                                                                    <div
                                                                        onClick={() => {
                                                                            const variantIndex = formData.variants.findIndex(v => v.color === color);
                                                                            setVariantUploadIndex(variantIndex);
                                                                            setUploadSlot("gallery");
                                                                            fileInputRef.current.click();
                                                                            // stay on images tab so upload is treated as gallery image
                                                                        }}
                                                                        className="aspect-square border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 cursor-pointer"
                                                                    >
                                                                        <Upload size={18} />
                                                                    </div>
                                                                )}

                                                            </div>
                                                        </div>

                                                    </div>
                                                );
                                            })}

                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-white/5 bg-black/50 flex gap-4">
                                <button
                                    form="inventory-form"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {editingProduct ? 'Update Manifest' : 'Confirm Archive'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-12 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:border-white transition-all"
                                >
                                    Relinquish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90"
                            onClick={() => setIsCategoryModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-md p-8 relative z-10"
                        >
                            <h3 className="text-lg font-black uppercase tracking-widest mb-6">
                                Create Category
                            </h3>

                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="CATEGORY NAME"
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white uppercase tracking-widest"
                            />

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={async () => {
                                        if (!newCategoryName) return;

                                        try {
                                            const slug = newCategoryName
                                                .toLowerCase()
                                                .replace(/\s+/g, '-');

                                            const newCat = await adminService.createCategory({
                                                name: newCategoryName.trim(),
                                                slug
                                            });

                                            await fetchCategories();

                                            setFormData((p) => ({
                                                ...p,
                                                category_id: newCat.id
                                            }));

                                            setNewCategoryName('');
                                            setIsCategoryModalOpen(false);
                                        } catch (err) {
                                            alert('FAILED TO CREATE CATEGORY');
                                        }
                                    }}
                                    className="flex-1 bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Create
                                </button>

                                <button
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="flex-1 border border-white/10 py-3 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default AdminInventory;
