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
                    variantImage: item.variant_image || item.image || null,
                    image: item.variant_image || item.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200',
                    id: item.product_id, // Keep consistency with frontend product.id
                    itemId: item.item_id, // Backend primary key
                    variantId: item.variant_id,
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

        // If no variantId is provided (e.g., from ProductCard Quick Add),
        // we fetch the full product to get the first available variant.
        if (!finalVariantId && user) {
            try {
                const { productService } = await import('../services/productService');
                const fullProduct = await productService.getProduct(product.id);
                if (fullProduct.variants && fullProduct.variants.length > 0) {
                    finalVariantId = fullProduct.variants[0].id;
                }
            } catch (error) {
                console.error('Failed to auto-discover variant', error);
            }
        }

        // Ensure image fallback before persisting
        const productWithImage = {
            ...product,
            variantImage: product.variantImage || product.variant_image || product.main_image || product.image || null,
            image: product.variantImage || product.variant_image || product.main_image || product.image || 'https://images.unsplash.com/photo-1539109132335-34a91bfd89da?auto=format&fit=crop&q=90&w=1200'
        };

        const newItem = {
            ...productWithImage,
            variantId: finalVariantId,
            quantity,
            id: product.id,
            uniqueKey: `${product.id}-${finalVariantId || 'default'}`
        };

        setCartItems(prev => {
            const existing = prev.find(item => item.uniqueKey === newItem.uniqueKey);
            if (existing) {
                return prev.map(item =>
                    item.uniqueKey === newItem.uniqueKey
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });

        if (user && finalVariantId) {
            try {
                const response = await cartService.addToCart(user.id, quantity, finalVariantId);
                // After adding to server, we refresh to get standardized data (images etc.)
                fetchCart();
            } catch (error) {
                console.error('Failed to sync cart with server', error);
            }
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
