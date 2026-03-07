import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountDashboard from './pages/AccountDashboard'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminProducts from './admin/AdminProducts'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

function App() {
    return (
        <Layout>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
                    <Route path="/order-tracking" element={<OrderTrackingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/account" element={<AccountDashboard />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/admin" element={<AdminAnalytics />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                </Routes>
            </AnimatePresence>
        </Layout>
    )
}

export default App
