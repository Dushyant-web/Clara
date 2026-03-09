import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sessionToken, setSessionToken] = useState(null)

    useEffect(() => {
        // Check for existing session in localStorage
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
            setSessionToken(savedToken)
            // In a real app, you'd fetch the user profile here
            // For now, we'll just stop loading
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }, [])

    const logout = () => {
        localStorage.removeItem('token')
        setSessionToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, logout, setUser, setSessionToken }}>
            {children}
        </AuthContext.Provider>
    )
}
