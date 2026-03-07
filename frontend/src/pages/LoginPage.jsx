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
