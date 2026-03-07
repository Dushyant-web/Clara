import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const LoginPage = () => {
    const [method, setMethod] = useState('phone') // 'phone' or 'otp' or '2fa'
    const [phoneNumber, setPhoneNumber] = useState('')
    const { loginWithOTP, verifyOTPAndLogin, verify2FAAndLogin } = useAuth()
    const { showAlert, addNotification } = useNotifications()
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const navigate = useNavigate()

    const handlePhoneSubmit = async (e) => {
        e.preventDefault()
        if (!phoneNumber) return showAlert('Please enter a phone number', 'error')

        await loginWithOTP(phoneNumber)
        showAlert('OTP sent successfully', 'success')
        setMethod('otp')
    }

    const handleOtpComplete = async () => {
        const res = await verifyOTPAndLogin(otp.join(''), true) // Simulate needing 2FA
        if (res.status === 'needs_2fa') {
            setMethod('2fa')
        } else {
            addNotification('Welcome Back', 'Successfully signed in to your account.', 'login')
            navigate('/account')
        }
    }

    const handle2FAComplete = async () => {
        await verify2FAAndLogin('123456')
        showAlert('Identity verified', 'success')
        addNotification('Security Alert', 'New login detected from unusual device.', 'security')
        navigate('/account')
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-16">
                    <div className="h-px w-12 bg-white/20 mx-auto" />
                </div>
                # Task: Premium Streetwear E-commerce Website UI

                ## 1. Project Initialization
                - [x] Create Vite project with React + TailwindCSS (using `create-vite@latest`)
                - [x] Install dependencies: `framer-motion lucide-react recharts react-router-dom zustand lucide-react`
                - [x] Configure Tailwind with custom fonts (Playfair Display, Inter) and color palette (Black/White)
                - [x] Set up basic folder structure (`src/components`, `src/pages`, `src/admin`, `src/contexts`, etc.)

                ## 2. Layout & Global Components
                - [x] Create `Navbar` with Search, Wishlist, Cart, and Notifications
                - [x] Create `Footer` (minimal luxury design)
                - [x] Implement `Layout` wrapper with Framer Motion page transitions
                - [x] Create `NotificationCenter` dropdown

                ## 3. Contexts & State Management
                - [x] Implement `AuthContext` (handling OTP login and 2FA UI state)
                - [x] Implement `CartContext` and `WishlistContext` with Zustand
                - [x] Implement `NotificationContext` for global alerts

                ## 4. Main Pages Implementation
                - [x] **Home Page**:
                - [x] Full-screen Hero section with cinematic video/image
                - [x] Featured Collections & Best Sellers
                - [x] Brand Philosophy & Lookbook editorial
                - [x] Customer Reviews & Newsletter
                - [x] **Shop Page**:
                - [x] Product Grid with filterable sidebar
                - [x] AI-powered Search bar (UI only)
                - [x] **Product Page**:
                - [x] Cinematic gallery with zoom
                - [x] Size/Quantity selectors and stock indicators
                - [x] Reviews and related products

                ## 5. E-commerce Flow
                - [x] **Cart Page**: Luxury list view and summary panel
- [x] **Checkout Page**: Step-based (Shipping -> Delivery -> Payment)
                - [x] **Order Tracking**: Timeline and delivery map UI

                ## 6. User Account & Support
                - [x] **Account Dashboard**: Profile, Order History, Saved Items
                - [x] **Login/Register**: OTP verification UI and 2FA
                - [x] **Support**: Floating chat widget and Return/Refund request form
                - [x] **Invoice**: Preview and download UI

                ## 7. Admin Dashboard
                - [x] Dark luxury dashboard layouts
                - [x] **Analytics**: Revenue, Orders, and Top Products charts
                - [x] **Management**: Product, Order, Customer, and Coupon managers

                ## 8. PWA & Final Polish
                - [x] Configure PWA (manifest, service worker placeholder)
                - [x] Add smooth scroll and parallax effects
                - [x] Final responsive design check across mobile/tablet/desktop
                - [x] Verified build status (npm run build)


                ## 10. UI Refinement & Logo Integration [COMPLETED]
                - [x] Integrate circular "C" logo icon in Navbar
                - [x] Update brand name from "CALRA" to "CLARA"
                - [x] Fix Searchbar colors to be theme-aware
                - [x] Fix NotificationCenter colors to be theme-aware
                - [x] Fix ChatWidget colors to be theme-aware

                ## 11. Auth & Search Refinement [COMPLETED]
                - [x] Create `SignupPage` and link from `LoginPage`
                - [x] Implement `SearchOverlay` component
                - [x] Register new `/signup` route in `App.jsx`
                - [x] Trigger Search overlay from Navbar search button
                - [x] Refine Navbar icon spacing and alignment (per user feedback)

                ## 12. UI Polishing & Feature Audit [IN PROGRESS]
                - [x] Remove redundant Search Bar from `ShopPage`
                - [x] Fix Quick Add button text visibility on hover
                - [x] Perform full button/link audit and fix broken interactions

                ## 13. Checkout UI Refinement [COMPLETED]
                - [x] Remove `uppercase` from checkout headers, buttons, and inputs
                - [x] Update font for Total and Prices to `font-sans`
                - [x] Add `+91` prefix to phone input in Checkout
                - [x] Add Pincode field to shipping address form
                - [x] Implement toggle state for Payment Method (Card vs UPI)

                - [x] Make Cart Summary "Pure Black & White"
                - [x] Redesign Cart Summary to be more compact (remove heavy border)
                - [x] Fix Payment Method highlighting (remove white fill)

                ## 15. Final Polish & Order Confirmation [COMPLETED]
                - [x] Set "India" as default country in Checkout
                - [x] Add City and State fields to Checkout
                - [x] Refine `OrderConfirmationPage` content and layout
                - [x] Register new route and link from Checkout
                - [x] Polish PWA Install prompt aesthetic

                ## 16. Search & Auth UI Fixes [IN PROGRESS]
                - [ ] Fix Search Overlay background opacity
                - [ ] Remove redundant "CLARA." logo from Signup/Login pages
                - [ ] Remove `uppercase` from form inputs (name, email, phone)

                <AnimatePresence mode="wait">
                    {method === 'phone' && (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="space-y-4">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Sign In</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Enter your mobile number to receive a secure login code.</p>
                            </div>

                            <form onSubmit={handlePhoneSubmit} className="space-y-12">
                                <div className="relative border-b border-white/20 focus-within:border-white transition-all group">
                                    <span className="absolute left-0 bottom-4 text-xs font-bold text-gray-500 transition-colors group-focus-within:text-white">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-transparent pl-10 pb-4 text-sm font-bold tracking-widest focus:outline-none placeholder:text-neutral-800"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-white text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                                >
                                    Send OTP <ArrowRight size={16} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {method === 'otp' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="space-y-4">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Verification</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">We've sent a 6-digit code to <span className="text-white">+91 {phoneNumber}</span></p>
                            </div>

                            <div className="grid grid-cols-6 gap-3">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        className="aspect-square bg-neutral-900 border border-white/10 text-center text-xl font-serif focus:outline-none focus:border-white transition-all"
                                    />
                                ))}
                            </div>

                            <div className="space-y-8">
                                <button
                                    onClick={handleOtpComplete}
                                    className="w-full bg-white text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                                >
                                    Verify Code <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => setMethod('phone')}
                                    className="w-full border border-white/10 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                                >
                                    Resend OTP in 54s
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {method === '2fa' && (
                        <motion.div
                            key="2fa"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 text-white">
                                    <ShieldCheck size={32} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-2xl font-serif tracking-tighter uppercase mb-4">Secure Authentication</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">Please open your authenticator app to complete the two-factor authentication.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="relative border-b border-white/20 focus-within:border-white transition-all">
                                    <input
                                        type="text"
                                        placeholder="6-Digit 2FA Code"
                                        className="w-full bg-transparent pb-4 text-center text-sm font-bold tracking-[0.5em] focus:outline-none placeholder:text-neutral-800 placeholder:tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={handle2FAComplete}
                                    className="w-full bg-white text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                                >
                                    Confirm Login
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                        Don't have an account? <Link to="/signup" className="text-secondary font-bold underline underline-offset-4 ml-2">Create One</Link>
                    </p>
                </div>

                <p className="mt-24 text-center text-[10px] text-gray-600 uppercase tracking-widest">
                    By signing in you agree to our <a href="#" className="underline">Terms of Service</a> & <a href="#" className="underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
