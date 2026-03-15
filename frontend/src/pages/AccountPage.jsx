import React, { useState, useEffect } from 'react'
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Clock, FileText, RefreshCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { orderService } from '../services/orderService'
import { reviewService } from '../services/reviewService'
import { productService } from '../services/productService'

const AccountPage = () => {
    const { user, logout } = useAuth()
    const { wishlist } = useCart()
    const [recentOrders, setRecentOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [userReviews, setUserReviews] = useState([])
    const [recentlyViewed, setRecentlyViewed] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        const fetchAccountData = async () => {
            try {
                const orders = await orderService.getUserOrders(user.id)
                setRecentOrders(orders || [])

                const reviews = await reviewService.getUserReviews(user.id)
                setUserReviews(reviews || [])
                setRecentlyViewed([]) // Placeholder since API does not exist
            } catch (err) {
                console.error('Failed to load account data', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAccountData()
    }, [user, navigate])

    const menuItems = [
        { name: 'Order History', icon: Package, count: recentOrders.length, action: 'orders' },
        { name: 'My Wishlist', icon: Heart, count: wishlist.length, link: '/wishlist' },
        { name: 'Saved Addresses', icon: MapPin, link: '/account/addresses' },
        { name: 'Account Settings', icon: Settings },
    ]

    if (!user) return null

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen transition-colors duration-500">
            <div className="container mx-auto px-6 text-secondary">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-secondary/5 border border-secondary/10 rounded-full flex items-center justify-center text-secondary text-2xl font-serif">
                            {(
                              user?.name && user.name !== 'Guest User'
                                ? user.name
                                : user?.username
                                  ? user.username
                                  : user?.email
                                    ? user.email.split('@')[0]
                                    : 'U'
                            )
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif tracking-tighter uppercase">
                              {(user?.name && user.name !== 'Guest User')
                                ? user.name
                                : user?.username
                                  ? user.username
                                  : (user?.email ? user.email.split('@')[0] : 'User')}
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Member since {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-secondary transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-4">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.link) navigate(item.link)
                                    if (item.action === 'orders') setSelectedOrder(null)
                                }}
                                className="w-full flex justify-between items-center p-6 bg-secondary/5 border border-secondary/10 hover:border-secondary transition-all group"
                            >

                                <div className="flex items-center gap-6">
                                    <item.icon size={20} className="text-gray-500 group-hover:text-secondary transition-colors" />
                                    <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
                                </div>

                                {item.count !== undefined && (
                                    <span className="bg-secondary/5 px-2 py-1 text-[10px] font-bold text-gray-500">{item.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Recent Orders */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recent Orders</h2>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="bg-secondary/5 p-12 border border-secondary/10 animate-pulse"></div>
                                ) : recentOrders.length > 0 ? (
                                    recentOrders.map((order) => {
                                        return (
                                            <div
                                                key={order.order_id}
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-secondary/5 p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-secondary/10 hover:border-secondary/20 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="flex gap-3">
                                                        {Array.isArray(order.items) && order.items.length > 0 ? (
                                                            order.items.map((item, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="w-12 h-12 border border-secondary/10 bg-secondary/10 overflow-hidden"
                                                                >
                                                                    {item.image ? (
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.product_name || "Product"}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package size={14} className="text-secondary/40" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center border border-secondary/10">
                                                                <Package size={16} className="text-secondary/40" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">Order #{order.order_id}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: {order.status}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <p className="text-sm font-serif group-hover:text-amber-700/80 transition-colors">₹{order.total_amount}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-secondary transition-colors" />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="bg-secondary/5 p-12 border border-secondary/10 text-center">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">No orders found</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {selectedOrder && (
                        <section className="border border-secondary/10 p-8 bg-secondary/5">

                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">
                                    Order Details
                                </h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-secondary">
                                    Close
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="bg-primary/30 p-4 border border-secondary/5 mb-6">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">Order ID</p>
                                        <p className="font-serif text-lg">#{selectedOrder.order_id}</p>

                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-3">Status</p>
                                        <p className="text-sm tracking-widest uppercase">{selectedOrder.status}</p>

                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-3">Total</p>
                                        <p className="font-serif text-amber-700/80">₹{selectedOrder.total_amount}</p>
                                    </div>

                                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Products</p>

                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 border border-secondary/10 p-4 bg-primary/20">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.product_name}
                                                            className="w-16 h-16 object-cover border border-secondary/10"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center">
                                                            <Package size={16} className="text-secondary/30" />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="text-sm font-serif">{item.product_name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                            {item.color || ''} {item.size || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-10">
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const invoiceBlob = await orderService.getInvoice(selectedOrder.order_id);
                                                const url = window.URL.createObjectURL(new Blob([invoiceBlob]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `invoice_${selectedOrder.order_id}.pdf`);
                                                document.body.appendChild(link);
                                                link.click();
                                            } catch (err) {
                                                console.error("Failed to download invoice", err);
                                            }
                                        }}
                                        className="w-full flex justify-between items-center p-4 border border-secondary/10 bg-primary/20 hover:border-secondary hover:bg-secondary/5 transition-all group"
                                    >
                                        <span className="text-xs uppercase tracking-widest">Download Invoice</span>
                                        <FileText size={16} className="text-gray-500 group-hover:text-secondary" />
                                    </button>

                                    <button className="w-full flex justify-between items-center p-4 border border-secondary/10 bg-primary/20 hover:border-secondary hover:bg-secondary/5 transition-all group opacity-50 cursor-not-allowed">
                                        <span className="text-xs uppercase tracking-widest">Request Refund / Return</span>
                                        <RefreshCcw size={16} className="text-gray-500" />
                                    </button>

                                    {/* Shipment Address */}
                                    {selectedOrder.shipping_address && (
                                        <div className="border border-secondary/10 p-4 bg-primary/20 mt-6">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                                                Shipment Address
                                            </p>

                                            <p className="text-sm font-serif">
                                                {selectedOrder.shipping_address.name}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {selectedOrder.shipping_address.line1}
                                            </p>

                                            {selectedOrder.shipping_address.line2 && (
                                                <p className="text-xs text-gray-400">
                                                    {selectedOrder.shipping_address.line2}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-400 mt-1">
                                                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {selectedOrder.shipping_address.country}
                                            </p>

                                            {selectedOrder.shipping_address.phone && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Phone: {selectedOrder.shipping_address.phone}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                        )}

                        {/* Recently Viewed (Demo) */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Recently Viewed</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {recentlyViewed.length === 0 ? (
                                <p className="text-xs text-gray-500">No recently viewed products</p>
                            ) : (
                                recentlyViewed.map((p) => (
                                    <Link key={p.id} to={`/products/${p.slug}`}>
                                        <div className="aspect-[3/4] border border-secondary/10 bg-secondary/5 flex items-center justify-center text-xs">
                                            {p.name}
                                        </div>
                                    </Link>
                                ))
                            )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">
                                My Reviews
                            </h2>

                            {userReviews.length === 0 ? (
                                <div className="bg-secondary/5 p-12 border border-secondary/10 text-center">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">
                                        No reviews written yet
                                    </p>
                                </div>
                            ) : (
                                userReviews.map((review) => (
<div key={review.id} className="border border-secondary/10 p-6 mb-4 bg-secondary/5">

<p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
{review.product_name || 'Product'} {review.color || review.size ? `• ${review.color || ''} ${review.size || ''}` : ''}
</p>

<p className="text-xs mb-2">Rating: {review.rating}★</p>
<p className="text-sm mb-4">{review.comment}</p>

{Array.isArray(review.images) && review.images.length > 0 && (
<div className="flex gap-3 mb-3 flex-wrap">
{review.images.map((img, i) => (
<img key={i} src={img} alt="review" className="w-20 h-20 object-cover border border-secondary/10" />
))}
</div>
)}

{Array.isArray(review.videos) && review.videos.length > 0 && (
<div className="flex gap-3 mb-3 flex-wrap">
{review.videos.map((vid, i) => (
<video key={i} src={vid} controls className="w-40 border border-secondary/10" />
))}
</div>
)}

{Array.isArray(review.replies) && review.replies.length > 0 && (
<div className="mt-4 space-y-2">
{review.replies.map((r)=> (
<div key={r.id} className="border-l border-secondary pl-4 italic text-sm text-gray-400">
Admin Reply: {r.reply}
</div>
))}
</div>
)}

<button
onClick={async () => {
    try {
        await reviewService.deleteReview(review.id)
        setUserReviews(prev => prev.filter(r => r.id !== review.id))
    } catch (err) {
        console.error('Failed to delete review', err)
    }
}}
className="text-xs text-red-500 mt-4 hover:underline"
>
Delete Review
</button>

</div>
))
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountPage
