import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import ChatWidget from './components/ChatWidget';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LookbookPage from './pages/LookbookPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionPage from './pages/CollectionPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AddressPage from './pages/AddressPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminInventory from './admin/AdminInventory';
import AdminOrders from './admin/AdminOrders';
import AdminNewsletter from './admin/AdminNewsletter';
import AdminPromos from './admin/AdminPromos';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-primary text-secondary overflow-hidden">
              <Navbar />
              <CartDrawer />
              <ChatWidget />

              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/collections/:slug" element={<CollectionPage />} />
                    <Route path="/lookbook" element={<LookbookPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/products/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                    <Route path="/account/addresses" element={<AddressPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminInventory />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="newsletter" element={<AdminNewsletter />} />
                      <Route path="promos" element={<AdminPromos />} />
                    </Route>
                  </Routes>
                </AnimatePresence>
              </main>

              <Footer />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
