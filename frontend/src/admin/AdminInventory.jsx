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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // info, variants, images
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category_id: 1,
        price: '',
        description: '',
        image: '',
        variants: [],
        images: []
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts(1, 100);
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
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
                    // Standardize to the format expected by the modal (array of objects with image_url)
                    productImages = imgRes.map(img => ({ image_url: img.image_url }));
                } catch (e) {
                    console.error("Failed to load product images", e);
                }

                setEditingProduct(fullProduct);
                setFormData({
                    name: fullProduct.name,
                    category_id: fullProduct.category_id || 1,
                    price: fullProduct.price || '',
                    description: fullProduct.description || '',
                    image: fullProduct.image || '',
                    variants: fullProduct.variants || [],
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
                image: '',
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
            if (activeTab === 'info') {
                setFormData(prev => ({ ...prev, image: url }));
            } else {
                setFormData(prev => ({ ...prev, images: [...prev.images, { image_url: url, isNew: true }] }));
            }
        } catch (err) {
            alert('UPLOAD FAILED.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let productId = editingProduct?.id;

            // 1. Save main product info
            const productPayload = {
                title: formData.name,
                description: formData.description,
                category_id: parseInt(formData.category_id),
                image: formData.image
            };

            if (editingProduct) {
                await adminService.updateProduct(productId, productPayload);
            } else {
                const newProduct = await adminService.createProduct(productPayload);
                productId = newProduct.id;
            }

            // 2. Save variants
            for (const v of formData.variants) {
                if (v.id) {
                    await adminService.updateVariantFull(v.id, {
                        size: v.size,
                        color: v.color,
                        price: v.price ? parseFloat(v.price) : 0,
                        stock: parseInt(v.stock),
                        sku: v.sku
                    });
                } else {
                    await adminService.updateVariantFull(v.id, {
                        size: v.size,
                        color: v.color,
                        price: v.price ? parseFloat(v.price) : 0,
                        stock: parseInt(v.stock),
                        sku: v.sku
                    });
                }
            }

            // 3. Save new images
            for (const img of formData.images) {
                if (img.isNew) {
                    await adminService.addProductImage(productId, img.image_url);
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
            variants: [...prev.variants, { size: '', color: '', price: '', stock: '', sku: '' }]
        }));
    };

    const removeVariant = async (index) => {
        const variant = formData.variants[index];

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
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Collection</th>
                            <th className="p-6 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Base Price</th>
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
                                                    src={p.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'}
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
                                    <td className="p-6"><span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{p.category || 'GENERAL'}</span></td>
                                    <td className="p-6 text-xs font-bold text-white">₹{p.price}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(p)} className="p-2 border border-white/5 hover:border-white transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => adminService.deleteProduct(p.id).then(fetchProducts)} className="p-2 border border-white/5 hover:border-red-500 text-red-500/70 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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
                                            <div className="grid grid-cols-2 gap-8">
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
                                                    <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Category ID</label>
                                                    <input
                                                        type="number"
                                                        value={formData.category_id}
                                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[8px] uppercase tracking-widest font-black text-gray-500">Primary Visual (URL or Upload)</label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={formData.image}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                        className="flex-1 bg-white/5 border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all font-mono"
                                                        placeholder="https://..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current.click()}
                                                        className="px-6 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
                                                    >
                                                        <Upload size={16} />
                                                    </button>
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
                                                    <div key={i} className="grid grid-cols-6 gap-4 p-6 bg-white/[0.03] border border-white/5 items-end group/item">
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
                                                                placeholder="1999"
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
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-4 gap-6">
                                                {/* Upload Trigger */}
                                                <div
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="aspect-[3/4] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                                                >
                                                    <Upload size={32} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Upload Image</span>
                                                </div>

                                                {/* Gallery Items */}
                                                {formData.images.map((img, i) => (
                                                    <div key={i} className="aspect-[3/4] relative group bg-neutral-900 border border-white/5">
                                                        <img
                                                            src={img.image_url}
                                                            className="w-full h-full object-cover"
                                                            alt={`Gallery ${i}`}
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                                                className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        {img.isNew && (
                                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white text-black text-[6px] font-black tracking-widest uppercase">New</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
