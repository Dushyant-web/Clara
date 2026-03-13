import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const fetchCart = async () => {
        if (!user) return;
        try {
            const data = await cartService.getCart(user.id);
            if (data && data.items) {
                const mappedItems = data.items.map(item => ({
                    ...item,
                    variantImage: item.variant_image || item.image_url || null,
                    image: item.variant_image || item.image_url || item.main_image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200',
                    id: item.product_id, // Keep consistency with frontend product.id
                    itemId: item.item_id, // Backend primary key
                    variantId: item.variant_id,
                    size: item.size,
                    color: item.color,
                    uniqueKey: `${item.product_id}-${item.variant_id}`
                }));
                setCartItems(mappedItems);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        }
    };

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const data = await wishlistService.getWishlist(user.id);
            if (data) {
                const mappedWishlist = data.map(item => ({
                    ...item,
                    image: item.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'
                }));
                setWishlist(mappedWishlist);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart();
            fetchWishlist();
        }
    }, [user]);

    const addToCart = async (product, variantId = null, quantity = 1) => {
        let finalVariantId = variantId;
        let variantDetails = null;

        try {
            const { productService } = await import('../services/productService');

            // If no variantId is provided, discover the first one
            if (!finalVariantId) {
                const fullProduct = await productService.getProduct(product.id);
                if (fullProduct.variants && fullProduct.variants.length > 0) {
                    finalVariantId = fullProduct.variants[0].id;
                    variantDetails = fullProduct.variants[0];
                }
            } else {
                // If variantId IS provided, we still need its details (size, color, image) 
                // to avoid falling back to product-level generic data in the UI
                const fullProduct = await productService.getProduct(product.id);
                variantDetails = fullProduct.variants?.find(v => v.id === finalVariantId);
            }
        } catch (error) {
            console.error('Failed to resolve variant details', error);
        }

        // Create the variant-specific item object
        const activeItem = {
            ...product,
            id: product.id,
            variantId: finalVariantId,
            size: variantDetails?.size || null,
            color: variantDetails?.color || null,
            price: variantDetails?.price || product.price,
            image: variantDetails?.image_url || variantDetails?.image || variantDetails?.images?.main || product.variant_image || product.main_image || product.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200',
            variantImage: variantDetails?.image_url || variantDetails?.image || variantDetails?.images?.main || product.variant_image || product.main_image || product.image || null,
            uniqueKey: `${product.id}-${finalVariantId || 'default'}`
        };

        // If user logged in, sync with backend
        if (user) {
            try {
                await cartService.addToCart(user.id, quantity, finalVariantId);
                await fetchCart(); // Refresh from source of truth
            } catch (error) {
                console.error('Checkout sync failed', error);
            }
        } else {
            // Local state fallback for guests
            setCartItems(prev => {
                const existing = prev.find(i => i.uniqueKey === activeItem.uniqueKey);
                if (existing) {
                    return prev.map(i => i.uniqueKey === activeItem.uniqueKey
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                    );
                }
                return [...prev, { ...activeItem, quantity }];
            });
        }
        setIsCartOpen(true);
    };

    const removeFromCart = async (itemId, uniqueKey) => {
        setCartItems(prev => prev.filter(item => item.uniqueKey !== uniqueKey));
        if (user && itemId) {
            try {
                await cartService.removeFromCart(itemId);
            } catch (error) {
                console.error('Failed to remove from server cart', error);
                // If it fails, we might want to refresh from server
                fetchCart();
            }
        }
    };

    const toggleWishlist = async (product) => {
        const exists = wishlist.some(item => item.id === product.id);

        if (exists) {
            setWishlist(prev => prev.filter(item => item.id !== product.id));
            if (user) {
                try {
                    await wishlistService.removeFromWishlist(user.id, product.id);
                } catch (error) {
                    console.error('Failed to remove from server wishlist', error);
                }
            }
        } else {
            // Ensure image fallback before persisting
            const productWithImage = {
                ...product,
                image: product.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'
            };
            setWishlist(prev => [...prev, productWithImage]);
            if (user) {
                try {
                    await wishlistService.addToWishlist(user.id, product.id);
                    // Refresh from server to get standardized image
                    fetchWishlist();
                } catch (error) {
                    console.error('Failed to add to server wishlist', error);
                }
            }
        }
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

    return (
        <CartContext.Provider value={{
            cartItems,
            wishlist,
            addToCart,
            removeFromCart,
            toggleWishlist,
            isInWishlist,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
