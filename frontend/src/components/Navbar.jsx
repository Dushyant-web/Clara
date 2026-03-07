import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Heart, User, Menu, X, Bell } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../hooks/useCartStore'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationCenter from './NotificationCenter'
import ThemeToggle from './ThemeToggle'
import SearchOverlay from './SearchOverlay'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const location = useLocation()
    const { cart } = useCartStore()
    const { notifications } = useNotifications()

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const unreadNotifications = notifications.filter(n => !n.read).length

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Shop All', path: '/shop' },
        { name: 'Collections', path: '/collections' },
        { name: 'Lookbook', path: '/lookbook' },
        { name: 'About', path: '/about' },
    ]

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-primary/90 backdrop-blur-md py-4 border-b border-secondary/10' : 'bg-transparent py-8'
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-secondary"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex gap-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-xs uppercase tracking-[0.2em] font-medium hover:text-grayAccent transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 md:gap-3 absolute left-1/2 -translate-x-1/2 group transition-all"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 relative overflow-hidden rounded-full border border-secondary/10 group-hover:scale-110 transition-transform duration-500">
                            <img
                                src="/assets/logo/logo-icon.png"
                                alt="CLARA Icon"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xl md:text-3xl font-serif font-bold tracking-tighter brand-blue hidden sm:block">
                            CLARA.
                        </span>
                        <span className="text-xl font-serif font-bold tracking-tighter brand-blue sm:hidden">
                            C.
                        </span>
                    </Link>

                    {/* Icons */}
                    <div className="flex items-center gap-6 md:gap-8 text-secondary">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hover:text-grayAccent transition-colors flex items-center justify-center p-2"
                        >
                            <Search size={20} strokeWidth={1.5} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="hover:text-grayAccent transition-colors relative"
                            >
                                <Bell size={20} strokeWidth={1.5} />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>
                            <NotificationCenter
                                isOpen={isNotificationsOpen}
                                onClose={() => setIsNotificationsOpen(false)}
                            />
                        </div>

                        <Link to="/login" className="hidden md:block hover:text-grayAccent transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                        <Link to="/account" className="hidden md:block hover:text-grayAccent transition-colors">
                            <Heart size={20} strokeWidth={1.5} />
                        </Link>
                        <Link to="/cart" className="relative hover:text-grayAccent transition-colors">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                            className="fixed inset-0 bg-white dark:bg-black z-[70] flex flex-col p-8"
                        >
                            <div className="flex justify-between items-center mb-16">
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/assets/logo/logo-icon.png"
                                        alt="CLARA Icon"
                                        className="w-8 h-8 object-cover rounded-full border border-secondary/10"
                                    />
                                    <span className="text-xl font-serif font-bold">CLARA.</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-2xl font-serif uppercase tracking-widest hover:pl-4 transition-all"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-white/10 my-4" />
                                <Link to="/login" className="text-sm uppercase tracking-widest flex items-center gap-2">
                                    <User size={18} /> Account
                                </Link>
                                <Link to="/wishlist" className="text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Heart size={18} /> Wishlist
                                </Link>
                                <Link to="/cart" className="text-sm uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag size={18} /> Bag ({cartCount})
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}

export default Navbar
