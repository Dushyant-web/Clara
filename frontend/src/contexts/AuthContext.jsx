import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null) // Mock user data
    const [isLoading, setIsLoading] = useState(true)
    const [sessionToken, setSessionToken] = useState(null)

    useEffect(() => {
        // Check for existing session in localStorage
        const savedToken = localStorage.getItem('calra_session_token')
        if (savedToken) {
            setSessionToken(savedToken)
            // Mock user fetching
            setTimeout(() => {
                setUser({ name: 'Dushyant S.', email: 'dushyant@example.com', role: 'member' })
                setIsLoading(false)
            }, 500)
        } else {
            setIsLoading(false)
        }
    }, [])

    const loginWithOTP = async (phoneNumber) => {
        // Simulate API call for OTP
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`OTP sent to ${phoneNumber}`)
                resolve(true)
            }, 1000)
        })
    }

    const verifyOTPAndLogin = async (otp, needs2FA = false) => {
        // Simulate verification
        return new Promise((resolve) => {
            setTimeout(() => {
                if (needs2FA) {
                    resolve({ status: 'needs_2fa' })
                } else {
                    const token = 'jwt_token_sample'
                    localStorage.setItem('calra_session_token', token)
                    setSessionToken(token)
                    setUser({ name: 'Dushyant S.', email: 'dushyant@example.com', role: 'member' })
                    resolve({ status: 'success' })
                }
            }, 1000)
        })
    }

    const verify2FAAndLogin = async (code) => {
        // Simulate 2FA verification
        return new Promise((resolve) => {
            setTimeout(() => {
                const token = 'jwt_token_sample_2fa'
                localStorage.setItem('calra_session_token', token)
                setSessionToken(token)
                setUser({ name: 'Dushyant S.', email: 'dushyant@example.com', role: 'member' })
                resolve({ status: 'success' })
            }, 1000)
        })
    }

    const logout = () => {
        localStorage.removeItem('calra_session_token')
        setSessionToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, loginWithOTP, verifyOTPAndLogin, verify2FAAndLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
