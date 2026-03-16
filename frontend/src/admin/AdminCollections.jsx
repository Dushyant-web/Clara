import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { collectionService } from '../services/collectionService';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';

const AdminCollections = () => {
    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [uploadingCollId, setUploadingCollId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [colls, prodsResponse] = await Promise.all([
                collectionService.getCollections(),
                productService.getProducts()
            ]);

            // Fetch images for each collection
            const collectionsWithImages = await Promise.all(
                (colls || []).map(async (c) => {
                    try {
                        const images = await collectionService.getCollectionImages(c.id);
                        return { ...c, images };
                    } catch (e) {
                        return { ...c, images: [] };
                    }
                })
            );

            setCollections(collectionsWithImages);
            // Allow assigning any product that doesn't have a collection
            const unassigned = (prodsResponse.products || prodsResponse || []).filter(p => !p.collection_id && !p.collection);
            setProducts(unassigned);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await collectionService.createCollection(formData);
            setFormData({ name: '', slug: '', description: '' });
            setIsCreating(false);
            fetchData();
        } catch (err) {
            console.error('Creation failed', err);
            alert('Failed to create collection.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this collection?')) return;
        try {
            await collectionService.deleteCollection(id);
            fetchData();
        } catch (err) {
            console.error('Deletion failed', err);
            alert('Failed to delete collection.');
        }
    };

    const handleAssign = async (productId, collectionId) => {
        if (!collectionId) return;
        try {
            await adminService.assignCollection(productId, collectionId);
            fetchData(); 
        } catch (err) {
            console.error('Assignment failed', err);
            alert('Failed to assign to collection.');
        }
    };

    const handleImageUpload = async (e, collectionId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCollId(collectionId);
        try {
            // First upload to cloud via generic endpoint if necessary or let addCollectionImage handle it directly
            // Looking at other admin services, we usually call adminService.uploadImage first
            const uploadRes = await adminService.uploadImage(file);
            const imageUrl = uploadRes.url || uploadRes.secure_url;
            
            await collectionService.addCollectionImage({
                collection_id: collectionId,
                image_url: imageUrl
            });
            alert('Image added to collection.');
            fetchData(); // You might want to reload to show the image if the getCollections endpoint returns them
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload image.');
        } finally {
            setUploadingCollId(null);
            e.target.value = ''; // Reset input
        }
    };

    if (loading) return <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Loading Collections...</div>;

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Curated Collections</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage seasonal and thematic product groupings</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                    >
                        <Plus size={16} /> Establish Collection
                    </button>
                )}
            </header>

            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-12 max-w-4xl"
                >
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-12">New Collection Parameters</h2>
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Collection Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase tracking-widest"
                                placeholder="E.G., THE NOIR SERIES"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">URL Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all tracking-widest"
                                placeholder="the-noir-series"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all tracking-widest uppercase h-32"
                                placeholder="A CURATED SELECTION OF DARK MINIMALISM."
                            />
                        </div>
                        <div className="flex gap-4 pt-8">
                            <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90">
                                Initialize Collection
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-12 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-white"
                            >
                                Abort
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {!isCreating && (
                <div className="space-y-12">
                    {/* Collections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {collections.map((coll) => (
                            <div key={coll.id} className="bg-white/5 border border-white/5 p-8 flex flex-col justify-between group hover:border-white/10 transition-colors">
                                <div className="mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl uppercase tracking-tighter font-black">{coll.name}</h3>
                                        <button 
                                            onClick={() => handleDelete(coll.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Slug: {coll.slug}</p>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed line-clamp-3 mb-6">{coll.description}</p>
                                    
                                    {/* Image Display if included in basic collection fetch */}
                                    {coll.images && coll.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {coll.images.map((img, i) => (
                                                <img key={i} src={img.image_url} alt="collection" className="w-16 h-16 object-cover border border-white/10 grayscale hover:grayscale-0 transition-all"/>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t border-white/10 pt-6">
                                    <label className="cursor-pointer flex items-center justify-center gap-2 py-3 border border-white/5 text-[8px] font-black uppercase tracking-widest hover:border-white transition-all w-full text-center">
                                        <ImageIcon size={12} />
                                        {uploadingCollId === coll.id ? 'UPLOADING...' : 'ADD HERO IMAGE'}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, coll.id)}
                                            disabled={uploadingCollId === coll.id}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Unassigned Products */}
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <Link size={20} /> Assign Products
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white/5 border border-white/5 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xs uppercase tracking-[0.2em] font-black mb-2">{product.name}</h3>
                                        <p className="text-[10px] text-gray-500 mb-6">SKU: {product.sku || product.id}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 bg-black border border-white/10 p-3 text-[10px] font-bold uppercase tracking-widest focus:border-white transition-all"
                                            onChange={(e) => handleAssign(product.id, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>ADD TO COLLECTION...</option>
                                            {collections.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-full p-8 border border-white/5 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                                    All products are assigned to collections.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCollections;
