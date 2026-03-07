import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary/10 transition-colors flex items-center justify-center"
            aria-label="Toggle Theme"
        >
            {isDarkMode ? (
                <Sun size={20} strokeWidth={1.5} />
            ) : (
                <Moon size={20} strokeWidth={1.5} />
            )}
        </motion.button>
    )
}

export default ThemeToggle
