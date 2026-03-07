import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
    persist(
        (set) => ({
            cart: [],
            wishlist: [],

            addToCart: (product, size) => set((state) => {
                const existingItem = state.cart.find(item => item.id === product.id && item.size === size)
                if (existingItem) {
                    return {
                        cart: state.cart.map(item =>
                            (item.id === product.id && item.size === size)
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    }
                }
                return { cart: [...state.cart, { ...product, size, quantity: 1 }] }
            }),

            removeFromCart: (productId, size) => set((state) => ({
                cart: state.cart.filter(item => !(item.id === productId && item.size === size))
            })),

            updateQuantity: (productId, size, quantity) => set((state) => ({
                cart: state.cart.map(item =>
                    (item.id === productId && item.size === size)
                        ? { ...item, quantity: Math.max(1, quantity) }
                        : item
                )
            })),

            toggleWishlist: (product) => set((state) => {
                const isWishlisted = state.wishlist.some(item => item.id === product.id)
                if (isWishlisted) {
                    return { wishlist: state.wishlist.filter(item => item.id !== product.id) }
                }
                return { wishlist: [...state.wishlist, product] }
            }),

            clearCart: () => set({ cart: [] }),
        }),
        {
            name: 'calra-storage',
        }
    )
)
