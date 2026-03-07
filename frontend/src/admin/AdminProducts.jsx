import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Filter } from 'lucide-react'
import { featuredProducts } from '../utils/mockData'

const AdminProducts = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8 lg:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif tracking-tighter uppercase mb-2">Inventory Management</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Manage your premium stock and new drops</p>
                </div>
                <button className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2">
                    <Plus size={16} /> Add New Piece
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH PRODUCTS..."
                        className="w-full bg-neutral-900 border border-white/5 px-12 py-3 text-[10px] uppercase tracking-widest focus:outline-none focus:border-white transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 border border-white/5 px-4 py-2 hover:border-white transition-all">
                        <Filter size={14} /> Category
                    </button>
                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 border border-white/5 px-4 py-2 hover:border-white transition-all">
                        Availability
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="pb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Product</th>
                            <th className="pb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Category</th>
                            <th className="pb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Price</th>
                            <th className="pb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Stock</th>
                            <th className="pb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {featuredProducts.map((p) => (
                            <tr key={p.id} className="border-b border-white/5 group hover:bg-neutral-900/40 transition-colors">
                                <td className="py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-neutral-900 overflow-hidden border border-white/5">
                                            <img src={p.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest">{p.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">ID: #{p.id}092</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{p.category}</span>
                                </td>
                                <td className="py-6 text-xs font-serif">${p.price}</td>
                                <td className="py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold">42 Units</span>
                                    </div>
                                </td>
                                <td className="py-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 border border-white/10 hover:border-white transition-all"><Edit2 size={14} /></button>
                                        <button className="p-2 border border-white/10 hover:border-red-500 text-red-500 transition-all"><Trash2 size={14} /></button>
                                        <button className="p-2 border border-white/10 hover:border-white transition-all"><MoreHorizontal size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminProducts
