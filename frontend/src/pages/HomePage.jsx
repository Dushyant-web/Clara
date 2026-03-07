import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { featuredProducts } from '../utils/mockData'

const HomePage = () => {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div
                    style={{ y }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=2000"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Hero Content */}
                <div className="relative z-20 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <h2 className="text-xs uppercase tracking-[0.5em] mb-6 text-gray-300 font-medium">
                            Autumn / Winter 2026
                        </h2>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
                        className="text-6xl md:text-9xl font-serif mb-8 leading-none tracking-tighter"
                    >
                        CRAFTED FOR <br /> THE BOLD
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-gray-400 max-w-lg mx-auto mb-12 text-sm md:text-base tracking-widest uppercase leading-relaxed"
                    >
                        Minimalist aesthetics. High-end quality. <br /> Streetwear redefined for the modern elite.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <button className="px-10 py-4 brand-blue-bg text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-primary border border-transparent hover:border-white transition-all duration-300 flex items-center gap-2 group shadow-xl">
                            Shop Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-10 py-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold hover:border-white transition-all duration-300">
                            Explore Lookbook
                        </button>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
                    <ChevronDown size={20} />
                </motion.div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 bg-primary">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-8 block"
                        >
                            Our Philosophy
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-5xl font-serif leading-tight mb-12"
                        >
                            "We believe in the beauty of simplicity and the power of detail. Our mission is to provide timeless pieces that transcend seasons."
                        </motion.h2>
                        <div className="h-px w-24 bg-secondary/20 mx-auto" />
                    </div>
                </div>
            </section>

            {/* Featured Collection */}
            <section className="py-24 bg-primary overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
                        <div className="max-w-xl">
                            <span className="text-xs uppercase tracking-[0.4em] text-secondary/40 mb-4 block font-bold">Selected Works</span>
                            <h2 className="text-4xl md:text-6xl font-serif tracking-tighter text-secondary">FEATURED <br /> COLLECTION</h2>
                        </div>
                        <Link to="/shop" className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 hover:text-grayAccent transition-colors group text-secondary">
                            View All Products <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 gap-y-12 md:gap-y-16">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Lookbook Editorial */}
            <section className="py-24 bg-primary">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7">
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <motion.img
                                    initial={{ scale: 1.1 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ duration: 1.5 }}
                                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
                                    alt="Editorial"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        </div>
                        <div className="lg:col-span-5 lg:pl-12">
                            <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 block">Editorial 01</span>
                            <h2 className="text-4xl md:text-5xl font-serif mb-8 max-w-sm leading-tight text-secondary">THE SILENCE OF STYLE</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md">
                                Captured in the urban shadows, our latest collection explores the intersection of minimalism and raw street culture. Every piece is a statement of intent.
                            </p>
                            <button className="px-10 py-4 border border-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-primary transition-all duration-300">
                                Explore Lookbook
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-32 bg-primary border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-serif mb-8 tracking-tighter">STAY IN THE RAW</h2>
                        <p className="text-gray-400 text-sm uppercase tracking-widest mb-12">
                            BE THE FIRST TO KNOW ABOUT NEW DROPS, EDITORIALS AND EXCLUSIVES.
                        </p>
                        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="ENTER YOUR EMAIL"
                                className="flex-grow bg-transparent border border-white/20 px-6 py-4 text-xs uppercase tracking-widest focus:outline-none focus:border-white transition-all"
                            />
                            <button className="bg-white text-primary px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                Join
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
