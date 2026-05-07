import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, Check, X, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { Link } from 'react-router-dom';

const AddressPage = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        user_id: user?.id,
        name: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        label: '',
        country: 'India'
    });

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const data = await addressService.getAddresses(user.id);
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await addressService.updateAddress(editingId, formData);
            } else {
                await addressService.createAddress(formData);
            }
            setIsAdding(false);
            setEditingId(null);
            fetchAddresses();
            setFormData({
                user_id: user?.id,
                name: '',
                address_line: '',
                city: '',
                state: '',
                postal_code: '',
                phone: '',
                label: '',
                country: 'India'
            });
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        setLoading(true);
        try {
            await addressService.deleteAddress(id);
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <Link to="/account" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-secondary mb-4 font-bold">
                            <ChevronLeft size={14} /> Back to Account
                        </Link>
                        <p className="text-[10px] tracking-[0.5em] font-bold text-gray-500 mb-4 uppercase">SHIPPING DIRECTORY</p>
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase">My Addresses</h1>
                    </div>
                    {!isAdding && !editingId && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-8 py-4 bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all flex items-center gap-3"
                        >
                            <Plus size={16} /> Add New Address
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Address List */}
                    <div className="space-y-6">
                        {loading && !isAdding && !editingId ? (
                            <div className="flex justify-center p-20">
                                <Loader2 size={40} className="animate-spin text-secondary/20" />
                            </div>
                        ) : addresses.length > 0 ? (
                            addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    layout
                                    className="p-8 bg-secondary/5 border border-secondary/10 relative group hover:border-secondary/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center">
                                                <MapPin size={18} className="text-secondary/40" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-widest">
                                                    {address.first_name || address.name || ''} {address.last_name || ''}
                                                </h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">{address.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                            onClick={() => {
                                                setEditingId(address.id);
                                                setFormData({
                                                    user_id: address.user_id,
                                                    name: address.name || '',
                                                    address_line: address.address_line || '',
                                                    city: address.city || '',
                                                    state: address.state || '',
                                                    postal_code: address.postal_code || '',
                                                    phone: address.phone || '',
                                                    label: address.label || '',
                                                    country: address.country || 'India'
                                                });
                                                setIsAdding(true);
                                            }}
                                                className="text-gray-400 hover:text-secondary transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-medium tracking-[0.2em] leading-relaxed uppercase">
                                        {address.address_line1 || address.address_line}<br />
                                        {address.address_line2 && <>{address.address_line2}<br /></>}
                                        {address.city}, {address.state} - {address.pincode || address.postal_code}
                                    </div>
                                </motion.div>
                            ))
                        ) : !isAdding && (
                            <div className="p-20 border border-dashed border-secondary/20 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">No saved addresses found.</p>
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Form */}
                    <AnimatePresence>
                        {(isAdding || editingId) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-10 bg-secondary/5 border border-secondary transition-all"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-xl font-serif tracking-tighter uppercase">{editingId ? 'Edit Address' : 'New Archive'}</h2>
                                    <button
                                        onClick={() => {
                                            setIsAdding(false);
                                            setEditingId(null);
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <input
                                        placeholder="Label (Home / Office / etc)"
                                        value={formData.label || ''}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                    />
                                    <input
                                        placeholder="Full Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                    />
                                    <input
                                        placeholder="Address"
                                        required
                                        value={formData.address_line}
                                        onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                                        className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <input
                                            placeholder="City"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                        />
                                        <input
                                            placeholder="State"
                                            required
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <input
                                            placeholder="Pincode"
                                            required
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                        />
                                        <input
                                            placeholder="Phone Number"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-secondary text-primary py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> {editingId ? 'Update Address' : 'Save Archive'}</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AddressPage;
