import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    // Check for saved theme or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('calra_theme')
        if (savedTheme) return savedTheme === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        const root = window.document.documentElement
        if (isDarkMode) {
            root.classList.add('dark')
            localStorage.setItem('calra_theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('calra_theme', 'light')
        }
    }, [isDarkMode])

    const toggleTheme = () => setIsDarkMode(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
