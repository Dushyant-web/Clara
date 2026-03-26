import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { lookbookService } from '../services/lookbookService';
import { adminService } from '../services/adminService';

const AdminLookbooks = () => {
    const [lookbooks, setLookbooks] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', season: '', description: '', image: '' });
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [creatingMainImg, setCreatingMainImg] = useState(false);
    const [dragging, setDragging] = useState({ lookbookId: null, index: null });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const lbData = await lookbookService.getLookbooks();

            // fetch images for each lookbook
            const lookbooksWithImages = await Promise.all(
                (lbData || []).map(async (lb) => {
                    try {
                        const images = await lookbookService.getLookbookImages(lb.id);
                        return { ...lb, images: images || [] };
                    } catch (err) {
                        console.error('Failed loading lookbook images', err);
                        return { ...lb, images: [] };
                    }
                })
            );

            setLookbooks(lookbooksWithImages);
        } catch (err) {
            console.error('Failed to fetch lookbooks', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await lookbookService.createLookbook(formData);
            setFormData({ title: '', season: '', description: '', image: '' });
            setIsCreating(false);
            fetchData();
        } catch (err) {
            console.error('Creation failed', err);
            alert('Failed to create lookbook.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lookbook entry?')) return;
        try {
            await lookbookService.deleteLookbook(id);
            fetchData();
        } catch (err) {
            console.error('Deletion failed', err);
            alert('Failed to delete lookbook.');
        }
    };

    const handleGridImageUpload = async (e, lookbookId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(lookbookId);
        try {
            const uploadRes = await adminService.uploadImage(file);
            const imageUrl = uploadRes.url || uploadRes.secure_url;
            
            await lookbookService.addLookbookImage({
                lookbook_id: lookbookId,
                image_url: imageUrl
            });
            alert('Grid image added to lookbook.');
            fetchData(); 
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload image.');
        } finally {
            setUploadingId(null);
            e.target.value = '';
        }
    };

    const handleMainImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCreatingMainImg(true);
        try {
            const uploadRes = await adminService.uploadImage(file);
            const imageUrl = uploadRes.url || uploadRes.secure_url;
            setFormData(prev => ({ ...prev, image: imageUrl }));
        } catch (err) {
            alert('Failed to upload main image');
        } finally {
            setCreatingMainImg(false);
        }
    };

    const persistImageOrder = async (lookbookId, images) => {
        try {
            const payload = images.map((img, index) => ({
                image_id: img.id || img.image_id || img.imageId,
                position: index
            }));

            console.log("Sending reorder payload", payload);

            await lookbookService.reorderLookbookImages(payload);

        } catch (err) {
            console.error("Failed saving image order", err);
            throw err;
        }
    };

    if (loading) return <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Loading Lookbooks...</div>;

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Editorial Lookbook</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage aesthetic campaigns and seasonal drops</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                    >
                        <Plus size={16} /> New Editorial Campaign
                    </button>
                )}
            </header>

            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-6 md:p-12 max-w-4xl"
                >
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-12">Campaign Parameters</h2>
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Campaign Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase tracking-widest"
                                    placeholder="WINTER SYNDICATE"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Season Qualifier</label>
                                <input
                                    type="text"
                                    value={formData.season}
                                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                    className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase tracking-widest"
                                    placeholder="AW26"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Editorial Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all tracking-widest uppercase h-32"
                                placeholder="..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center justify-between">
                                Main Campaign Image (URL)
                                <label className="cursor-pointer text-white underline hover:opacity-70 transition-opacity flex items-center gap-2">
                                    <ImageIcon size={10} /> {creatingMainImg ? 'Uploading...' : 'Upload'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleMainImageUpload} />
                                </label>
                            </label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all tracking-widest"
                                placeholder="https://..."
                            />
                            {formData.image && <img src={formData.image} alt="preview" className="mt-4 h-32 w-auto object-cover border border-white/10 grayscale" />}
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90">
                                Launch Campaign
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lookbooks.map((lb) => (
                        <div key={lb.id} className="bg-white/5 border border-white/5 group hover:border-white/10 transition-colors flex flex-col">
                            {lb.image && (
                                <div className="h-64 w-full bg-black relative overflow-hidden">
                                    <img src={lb.image} alt={lb.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                </div>
                            )}
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl uppercase tracking-tighter font-black">{lb.title}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{lb.season}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(lb.id); }}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-2 bg-black/50 rounded-full shrink-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed line-clamp-3 mb-6">{lb.description}</p>
                                    
                                    {/* Additional lookbook images */}
                                    {(() => {
                                        const images = lb.images || [];

                                        return (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
                                                        {images.length} / 10 Grid Images
                                                    </div>
                                                </div>

                                                {images.length > 0 && (
                                                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px,1fr))' }}>
                                                        {images.map((img, idx) => (
                                                            <div
                                                                key={img.id || idx}
                                                                draggable
                                                                onDragStart={() => setDragging({ lookbookId: lb.id, index: idx })}
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={() => {
                                                                    if (dragging.lookbookId !== lb.id) return;
                                                                    const reordered = [...images];
                                                                    const draggedItem = reordered.splice(dragging.index, 1)[0];
                                                                    reordered.splice(idx, 0, draggedItem);

                                                                    setLookbooks(prev =>
                                                                        prev.map(l => l.id === lb.id ? { ...l, images: reordered } : l)
                                                                    );
                                                                    // Removed automatic persistence here
                                                                    // persistImageOrder(lb.id, reordered);
                                                                }}
                                                                className="relative group cursor-move"
                                                            >
                                                                <img
                                                                    src={img.image_url}
                                                                    alt="grid"
                                                                    onClick={() => setPreviewImage(img.image_url)}
                                                                    className="w-full aspect-square object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all cursor-zoom-in"
                                                                />
                                                                <div className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-1 py-[1px]">
                                                                    {idx + 1}
                                                                </div>

                                                                {/* Delete button on hover */}
                                                                <button
                                                                    type="button"
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!window.confirm('Delete this image?')) return

                                                                        const imageId = img.id || img.image_id || img.imageId

                                                                        try {
                                                                            if (!imageId) {
                                                                                console.error('Image ID missing', img)
                                                                                alert('Image id not found')
                                                                                return
                                                                            }

                                                                            await adminService.deleteLookbookImage(imageId)

                                                                            // optimistic UI update
                                                                            const updated = lookbooks.map(l => {
                                                                                if (l.id !== lb.id) return l
                                                                                return {
                                                                                    ...l,
                                                                                    images: (l.images || []).filter(i => (i.id || i.image_id) !== imageId)
                                                                                }
                                                                            })

                                                                            setLookbooks(updated)

                                                                        } catch (err) {
                                                                            console.error('Image delete failed', err)
                                                                            alert('Failed to delete image')
                                                                        }
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {images.length === 0 && (
                                                    <div className="text-[9px] text-gray-600 uppercase tracking-widest border border-white/5 p-3 text-center">
                                                        No grid images uploaded yet
                                                    </div>
                                                )}
                                                {/* Update Image Order button */}
                                                <button
                                                    onClick={async () => {
                                                        const current = lookbooks.find(l => l.id === lb.id);
                                                        if (!current) return;

                                                        try {
                                                            await persistImageOrder(lb.id, current.images || []);
                                                            alert("Image order updated successfully");
                                                        } catch (e) {
                                                            console.error("Order update failed", e);
                                                            alert("Failed to update image order");
                                                        }
                                                    }} 
                                                    className="mt-3 w-full border border-white/10 py-2 text-[9px] uppercase tracking-widest hover:border-white transition"
                                                >
                                                    Update Image Order
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="border-t border-white/10 pt-6 mt-6">
                                    <label className="cursor-pointer flex items-center justify-center gap-2 py-3 border border-white/5 text-[8px] font-black uppercase tracking-widest hover:border-white transition-all w-full text-center">
                                        <Plus size={12} />
                                        {(lb.images?.length || 0) >= 10 ? 'IMAGE LIMIT REACHED' : (uploadingId === lb.id ? 'UPLOADING...' : 'ADD GRID IMAGE')}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                if ((lb.images?.length || 0) >= 10) {
                                                    alert('Maximum 10 images allowed per lookbook')
                                                    return
                                                }
                                                handleGridImageUpload(e, lb.id)
                                            }}
                                            disabled={uploadingId === lb.id || (lb.images?.length || 0) >= 10}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                    {lookbooks.length === 0 && (
                        <div className="col-span-full p-12 text-center border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">No active lookbooks in archive.</span>
                        </div>
                    )}
                </div>
            )}
        {/* SSENSE-style preview panel */}
        {previewImage && (
            <div
                className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row"
                onClick={() => setPreviewImage(null)}
            >
                <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
                    <img
                        src={previewImage}
                        className="max-h-[90%] max-w-[90%] object-contain"
                    />
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-6">
                        Live Layout Preview
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {lookbooks
                            .flatMap(lb => lb.images || [])
                            .slice(0,6)
                            .map((img,i) => (
                                <img
                                    key={i}
                                    src={img.image_url}
                                    className="w-full object-cover"
                                />
                            ))}
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default AdminLookbooks;
