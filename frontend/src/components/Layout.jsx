import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import PWAInstallPrompt from './PWAInstallPrompt'

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-primary">
            <Navbar />
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                className="flex-grow"
            >
                {children}
            </motion.main>
            <ChatWidget />
            <PWAInstallPrompt />
            <Footer />
        </div>
    )
}

export default Layout
