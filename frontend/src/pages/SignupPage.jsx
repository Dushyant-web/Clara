import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, User, Mail, Phone, ChevronRight } from 'lucide-react'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import "../firebase" // ensure Firebase app is initialized
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'

const SignupPage = () => {
    const [step, setStep] = useState('info') // 'info' or 'otp'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const { showAlert, addNotification } = useNotifications()
    const { signup } = useAuth()
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Safely destroys the active RecaptchaVerifier.
    // We let Firebase manage the DOM to avoid interfering with its internal
    // fallback mechanisms (like automatically triggering reCAPTCHA v2).
    const destroyRecaptcha = () => {
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear() } catch (_) {}
            window.recaptchaVerifier = null
        }
        const container = document.getElementById('recaptcha-container')
        if (container) container.innerHTML = ''
    }

    const handleInfoSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.phone) {
            return showAlert('Please fill in all fields', 'error')
        }

        setLoading(true)
        try {
            // Strip spaces and non-digit characters.
            // E.g. "81306 10047" → "8130610047" so the full phone is "+918130610047".
            const cleanPhone = formData.phone.replace(/\D/g, '')
            if (cleanPhone.length !== 10) {
                showAlert('Enter a valid 10-digit phone number', 'error')
                setLoading(false)
                return
            }

            // Destroy any previous verifier + wipe the container DOM node.
            destroyRecaptcha()

            const firebaseAuth = getAuth()
            window.recaptchaVerifier = new RecaptchaVerifier(
                'recaptcha-container',
                { size: 'invisible' },
                firebaseAuth
            )

            const fullPhone = '+91' + cleanPhone
            const result = await signInWithPhoneNumber(firebaseAuth, fullPhone, window.recaptchaVerifier)

            setConfirmationResult(result)
            showAlert('OTP sent to +91' + cleanPhone, 'success')
            setStep('otp')
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

            // Use AuthContext signup which calls backend and handles state
            await signup(idToken, formData.name, formData.email)

            addNotification(
                'Account Created',
                'Welcome to GAURK. Your account is ready.',
                'success'
            )
            navigate('/account')
        } catch (error) {
            console.error(error)
            showAlert('Invalid OTP', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {step === 'info' && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
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

                            <div className="space-y-4 text-center">
                                <h2 className="text-4xl font-serif tracking-tighter uppercase text-secondary">Join GAURK</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Create an account for exclusive access.</p>
                            </div>

                            <form onSubmit={handleInfoSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all group">
                                        <User size={14} className="absolute left-0 bottom-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary"
                                        />
                                    </div>
                                    <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all group">
                                        <Mail size={14} className="absolute left-0 bottom-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary"
                                        />
                                    </div>
                                    <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all group">
                                        <Phone size={14} className="absolute left-0 bottom-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-secondary text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'PROCESSING...' : 'Continue'} <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    Already have an account? <Link to="/login" className="text-secondary font-bold underline underline-offset-4">Sign In</Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'otp' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="space-y-4 text-center">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase text-secondary">Verification</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">We've sent a 6-digit code to <br /><span className="text-secondary font-bold">{formData.phone}</span></p>
                            </div>

                                <div className="grid grid-cols-6 gap-3">
                                    {otp.map((_, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={otp[idx]}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                const newOtp = [...otp]
                                                newOtp[idx] = val.slice(-1)
                                                setOtp(newOtp)
                                                if (val && idx < 5) {
                                                    e.target.nextSibling?.focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                                                    e.target.previousSibling?.focus()
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault()
                                                const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                                                if (pastedData) {
                                                    const newOtp = [...otp]
                                                    for (let i = 0; i < pastedData.length; i++) {
                                                        newOtp[i] = pastedData[i]
                                                    }
                                                    setOtp(newOtp)
                                                    const inputs = e.target.parentElement.querySelectorAll('input')
                                                    const focusIdx = Math.min(pastedData.length, 5)
                                                    inputs[focusIdx]?.focus()
                                                }
                                            }}
                                            className="aspect-square bg-secondary/5 border border-secondary/10 text-center text-xl font-serif text-secondary focus:outline-none focus:border-secondary transition-all"
                                        />
                                    ))}
                            </div>

                            <div className="space-y-6">
                                <button
                                    onClick={handleOtpComplete}
                                    disabled={loading}
                                    className="w-full bg-secondary text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'VERIFYING...' : 'Complete Signup'} <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => setStep('info')}
                                    className="w-full text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-secondary transition-all"
                                >
                                    Change Details
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-24 text-center text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    By joining you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>
                </p>
                <div id="recaptcha-container"></div>
            </div>
        </div>
    )
}

export default SignupPage
