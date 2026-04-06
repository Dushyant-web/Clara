import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth } from "../firebase"
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
    const [method, setMethod] = useState('phone')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const { showAlert, addNotification } = useNotifications()
    const { login } = useAuth()
    const navigate = useNavigate()

    // Safely destroys the active RecaptchaVerifier AND wipes the DOM container.
    // Simply calling .clear() can fail silently, leaving a stale widget in the
    // element, which causes "reCAPTCHA has already been rendered in this element"
    // on the next attempt. Manually clearing innerHTML guarantees a clean slate.
    const destroyRecaptcha = () => {
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear() } catch (_) {}
            window.recaptchaVerifier = null
        }
        const el = document.getElementById('recaptcha-container')
        if (el) el.innerHTML = ''
    }

    const handlePhoneSubmit = async (e) => {
        e.preventDefault()

        // Strip spaces and non-digit characters — e.g. "81306 10047" → "8130610047"
        const cleanPhone = phoneNumber.replace(/\D/g, '')
        if (!cleanPhone || cleanPhone.length !== 10) {
            showAlert('Enter a valid 10-digit phone number', 'error')
            return
        }

        setLoading(true)
        try {
            // Destroy any previous verifier + wipe the container DOM node.
            destroyRecaptcha()

            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                { size: 'invisible' }
            )
            await window.recaptchaVerifier.render()

            const fullPhone = '+91' + cleanPhone
            const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)

            setConfirmationResult(result)
            showAlert('OTP sent successfully', 'success')
            setMethod('otp')
        } catch (error) {
            console.error('OTP send error:', error.code, error.message)
            destroyRecaptcha()
            const msg = {
                'auth/invalid-phone-number': 'Invalid phone number. Enter a valid 10-digit number.',
                'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
                'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
                'auth/invalid-app-credential': 'reCAPTCHA failed. Refresh the page and try again.',
                'auth/captcha-check-failed': 'reCAPTCHA check failed. Refresh the page and try again.',
            }[error.code] || 'Failed to send OTP. Try again.'
            showAlert(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleOtpComplete = async () => {
        setLoading(true)
        try {
            const code = otp.join("")
            const result = await confirmationResult.confirm(code)
            const idToken = await result.user.getIdToken()

            // Use AuthContext login which calls backend and handles state
            await login(idToken, 'Guest User', 'guest@example.com')

            addNotification(
                'Welcome Back',
                'Successfully signed in to your account.',
                'login'
            )
            navigate('/account')
        } catch (error) {
            console.error(error)
            showAlert("Invalid OTP", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {method === 'phone' && (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="flex justify-center mb-12">
                                <Link to="/" className="w-16 h-16 relative overflow-hidden rounded-full border border-secondary/10 hover:scale-110 transition-transform duration-500">
                                    <img
                                        src="/assets/logo/gk_logo.png"
                                        alt="GAURK Icon"
                                        className="w-full h-full object-cover"
                                    />
                                </Link>
                            </div>

                            <div className="text-center space-y-4">
                                <p className="text-[10px] tracking-[0.5em] font-bold opacity-50 uppercase text-secondary">WELCOME BACK</p>
                                <h1 className="text-4xl font-serif text-secondary tracking-tighter uppercase">IDENTITY</h1>
                            </div>

                            <form onSubmit={handlePhoneSubmit} className="space-y-12">
                                <div className="relative border-b border-secondary/20 group focus-within:border-secondary transition-colors">
                                    <span className="absolute left-0 bottom-4 text-xs font-bold text-gray-500">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-transparent pl-10 pb-4 text-sm font-bold tracking-widest focus:outline-none text-secondary"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-secondary text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'SENDING...' : 'Send OTP'} <ArrowRight size={16} />
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
                            <h2 className="text-2xl font-serif tracking-tighter uppercase text-secondary text-center">
                                Verification
                            </h2>

                            <div className="grid grid-cols-6 gap-3">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        value={otp[idx]}
                                        onChange={(e) => {
                                            const newOtp = [...otp]
                                            newOtp[idx] = e.target.value
                                            setOtp(newOtp)
                                            // Auto-focus next input
                                            if (e.target.value && idx < 5) {
                                                e.target.nextSibling?.focus()
                                            }
                                        }}
                                        className="aspect-square bg-secondary/5 border border-secondary/10 text-center text-xl font-serif text-secondary focus:outline-none focus:border-secondary transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleOtpComplete}
                                disabled={loading}
                                className="w-full bg-secondary text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                {loading ? 'VERIFYING...' : 'Verify Code'} <ChevronRight size={16} />
                            </button>

                            <button
                                onClick={() => setMethod('phone')}
                                className="w-full text-[10px] tracking-[0.1em] opacity-50 hover:opacity-100 transition-opacity uppercase text-secondary font-bold"
                            >
                                Change Phone Number
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center text-secondary">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                        Don't have an account? <Link to="/signup" className="text-secondary font-bold underline underline-offset-4 ml-2">Create One</Link>
                    </p>
                </div>

                <p className="mt-24 text-center text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    By signing in you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>
                </p>
            </div>

            <div id="recaptcha-container"></div>
        </div>
    )
}

export default LoginPage
