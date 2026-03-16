import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderGit2, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cats, prodsResponse] = await Promise.all([
                categoryService.getCategories(),
                productService.getProducts()
            ]);
            setCategories(cats || []);
            // Filter products that don't belong to a category
            const unassigned = (prodsResponse.products || prodsResponse || []).filter(p => !p.category_id && !p.category);
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
            await categoryService.createCategory(formData);
            setFormData({ name: '', slug: '' });
            setIsCreating(false);
            fetchData();
        } catch (err) {
            console.error('Creation failed', err);
            alert('Failed to create category.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await categoryService.deleteCategory(id);
            fetchData();
        } catch (err) {
            console.error('Deletion failed', err);
            alert('Failed to delete category.');
        }
    };

    const handleAssign = async (productId, categoryId) => {
        if (!categoryId) return;
        try {
            await adminService.assignCategory(productId, categoryId);
            fetchData(); // Refresh to remove the product from unassigned list
        } catch (err) {
            console.error('Assignment failed', err);
            alert('Failed to assign category.');
        }
    };

    if (loading) {
        return <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Loading Categories...</div>;
    }

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Category Matrix</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Manage divisions and product architecture</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
                    >
                        <Plus size={16} /> Establish Division
                    </button>
                )}
            </header>

            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-12 max-w-4xl"
                >
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-12">New Division Parameters</h2>
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-500">Category Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black border border-white/10 p-4 text-xs font-bold focus:outline-none focus:border-white transition-all uppercase tracking-widest"
                                placeholder="E.G., OUTERWEAR"
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
                                placeholder="outerwear"
                                required
                            />
                        </div>
                        <div className="flex gap-4 pt-8">
                            <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90">
                                Initialize Division
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
                    {/* Categories Table */}
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <FolderGit2 size={20} /> Active Divisions
                        </h2>
                        <div className="bg-white/5 border border-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Name</th>
                                        <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Slug</th>
                                        <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-xs font-bold uppercase tracking-widest">{cat.name}</td>
                                            <td className="p-4 text-[10px] text-gray-400 tracking-widest">{cat.slug}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                                                No categories established.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unassigned Products */}
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <Link size={20} /> Unassigned Assets
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
                                            <option value="" disabled>ASSIGN TO...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="col-span-full p-8 border border-white/5 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                                    All products are assigned.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
