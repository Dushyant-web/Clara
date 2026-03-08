import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, User, Mail, Phone } from 'lucide-react'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth } from "../firebase"
import { useNotifications } from '../contexts/NotificationContext'

const SignupPage = () => {
    const [step, setStep] = useState('info') // 'info' or 'otp'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const { showAlert, addNotification } = useNotifications()
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [confirmationResult, setConfirmationResult] = useState(null)
    const navigate = useNavigate()

    const handleInfoSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.phone) {
            return showAlert('Please fill in all fields', 'error')
        }

        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    { size: "invisible" }
                )
                await window.recaptchaVerifier.render()
            }

            const appVerifier = window.recaptchaVerifier

            const fullPhone = "+91" + formData.phone

            const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)

            setConfirmationResult(result)

            showAlert('OTP sent to ' + formData.phone, 'success')

            setStep('otp')

        } catch (error) {
            console.error(error)
            showAlert('Failed to send OTP', 'error')
        }
    }

    const handleOtpComplete = async () => {

        try {

            const code = otp.join("")

            const result = await confirmationResult.confirm(code)

            const idToken = await result.user.getIdToken()

            const response = await fetch("https://clara-xpfh.onrender.com/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_token: idToken,
                    name: formData.name,
                    email: formData.email
                })
            })

            const data = await response.json()

            if (data.access_token) {
                localStorage.setItem("token", data.access_token)
            }

            addNotification(
                'Account Created',
                'Welcome to CLARA. Your account is ready.',
                'success'
            )

            navigate('/account')

        } catch (error) {
            console.error(error)
            showAlert('Invalid OTP', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-16">
                    <div className="h-px w-12 bg-secondary/20 mx-auto" />
                </div>

                <AnimatePresence mode="wait">
                    {step === 'info' && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4 text-center">
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Join CLARA</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Create an account for exclusive access.</p>
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
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary placeholder:text-neutral-800"
                                        />
                                    </div>
                                    <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all group">
                                        <Mail size={14} className="absolute left-0 bottom-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary placeholder:text-neutral-800"
                                        />
                                    </div>
                                    <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all group">
                                        <Phone size={14} className="absolute left-0 bottom-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-transparent pl-8 pb-4 text-xs font-bold tracking-widest focus:outline-none text-secondary placeholder:text-neutral-800"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full brand-blue-bg text-white py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-primary border border-transparent hover:border-secondary transition-all duration-300"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
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
                                <h2 className="text-2xl font-serif tracking-tighter uppercase">Verification</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">We've sent a 6-digit code to <br /><span className="text-secondary font-bold">{formData.phone}</span></p>
                            </div>

                            <div className="grid grid-cols-6 gap-3">
                                {otp.map((_, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        value={otp[idx]}
                                        onChange={(e) => {
                                            const newOtp = [...otp]
                                            newOtp[idx] = e.target.value
                                            setOtp(newOtp)
                                        }}
                                        className="aspect-square bg-secondary/5 border border-secondary/10 text-center text-xl font-serif focus:outline-none focus:border-secondary transition-all text-secondary"
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                <button
                                    onClick={handleOtpComplete}
                                    className="w-full brand-blue-bg text-white py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-primary border border-transparent hover:border-secondary transition-all duration-300"
                                >
                                    Complete Signup <ArrowRight size={16} />
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
