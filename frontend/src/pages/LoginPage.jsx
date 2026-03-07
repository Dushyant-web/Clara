import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth } from "../firebase"
import { useNotifications } from '../contexts/NotificationContext'

const LoginPage = () => {

    const [method, setMethod] = useState('phone')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [confirmationResult, setConfirmationResult] = useState(null)

    const { showAlert, addNotification } = useNotifications()

    const navigate = useNavigate()

    const handlePhoneSubmit = async (e) => {

        e.preventDefault()

        if (!phoneNumber) {
            showAlert('Enter phone number', 'error')
            return
        }

        try {

            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "invisible"
                    }
                )
                await window.recaptchaVerifier.render()
            }

            const appVerifier = window.recaptchaVerifier

            const fullPhone = "+91" + phoneNumber

            const result = await signInWithPhoneNumber(
                auth,
                fullPhone,
                appVerifier
            )

            setConfirmationResult(result)

            showAlert("OTP sent successfully", "success")

            setMethod("otp")

        } catch (error) {

            console.error(error)

            showAlert("Failed to send OTP", "error")

        }

    }

    const handleOtpComplete = async () => {
        try {
            const code = otp.join("")
            const result = await confirmationResult.confirm(code)

            // Get Firebase ID token
            const idToken = await result.user.getIdToken()

            // Send token to backend for verification
            const response = await fetch("https://clara-xpfh.onrender.com/auth/firebase-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_token: idToken
                })
            })

            const data = await response.json()

            // Store JWT from backend
            if (data.token) {
                localStorage.setItem("token", data.token)
            }

            addNotification(
                'Welcome Back',
                'Successfully signed in to your account.',
                'login'
            )

            navigate('/shop')
        } catch (error) {
            console.error(error)
            showAlert("Invalid OTP", "error")
        }
    }

    return (

        <div className="min-h-screen bg-primary flex items-center justify-center p-6">

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

                            <h2 className="text-2xl font-serif tracking-tighter uppercase">Sign In</h2>

                            <form onSubmit={handlePhoneSubmit} className="space-y-12">

                                <div className="relative border-b border-white/20">

                                    <span className="absolute left-0 bottom-4 text-xs font-bold text-gray-500">+91</span>

                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-transparent pl-10 pb-4 text-sm font-bold tracking-widest focus:outline-none"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-white text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                >

                                    Send OTP <ArrowRight size={16} />

                                </button>

                            </form>

                            <div id="recaptcha-container"></div>

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

                            <h2 className="text-2xl font-serif tracking-tighter uppercase">
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

                                        }}
                                        className="aspect-square bg-neutral-900 border border-white/10 text-center text-xl font-serif"
                                    />

                                ))}

                            </div>

                            <button
                                onClick={handleOtpComplete}
                                className="w-full bg-white text-primary py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >

                                Verify Code <ChevronRight size={16} />

                            </button>

                        </motion.div>

                    )}

                </AnimatePresence>

            </div>

        </div>

    )

}

export default LoginPage