import React from 'react'
import { motion } from 'framer-motion'

const AboutPage = () => {
    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen text-secondary transition-colors duration-500">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <div className="max-w-4xl mb-32">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-[0.5em] text-gray-500 mb-6 block font-bold"
                    >
                        Our Origin
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-serif tracking-tighter leading-none mb-12 uppercase"
                    >
                        THE SILENCE <br /> OF STYLE.
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="h-px w-24 bg-secondary/20 mb-12"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-500 text-lg md:text-2xl uppercase tracking-widest leading-relaxed max-w-2xl font-bold"
                    >
                        GAURK was born from a singular vision: to strip away the noise of modern fashion and reveal the timeless beauty of pure form.
                    </motion.p>
                </div>

                {/* Philosophy Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="relative aspect-[3/4] overflow-hidden border border-secondary/5 bg-secondary/5">
                            <img
                                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1000"
                                alt="Atelier"
                                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
                            />
                        </div>
                    </motion.div>

                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-serif tracking-tight mb-6 uppercase">The Philosophy</h2>
                            <p className="text-gray-500 leading-relaxed font-bold uppercase tracking-widest text-sm">
                                We believe that true luxury isn't found in excess, but in the intentionality of every stitch. Our pieces are designed to be quiet yet profound—crafted for those who understand that the most powerful statements are often the softest.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-serif tracking-tight mb-6 uppercase">The Craft</h2>
                            <p className="text-gray-500 leading-relaxed font-bold uppercase tracking-widest text-sm">
                                Every GAURK garment is a product of obsessive craftsmanship. From the selection of ultra-premium raw materials to the precision of hand-finished details, we prioritize longevity over trends and quality over volume.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-secondary/5 pt-24 mb-40">
                    {[
                        { title: "Longevity", desc: "Designed to transcend seasons and outlast trends." },
                        { title: "Sourcing", desc: "Sourcing only the finest sustainable materials globally." },
                        { title: "Ethical", desc: "Building meaningful relationships with our master artisans." }
                    ].map((value, idx) => (
                        <motion.div
                            key={value.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 mb-4">0{idx + 1}</h3>
                            <h4 className="text-2xl font-serif mb-4 uppercase">{value.title}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 leading-relaxed font-bold">
                                {value.desc}
                            </p>
                        </motion.div>
                    ))}
                </section>

                {/* Final Quote */}
                <section className="text-center max-w-3xl mx-auto py-24">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="text-3xl md:text-5xl font-serif leading-tight mb-12 uppercase"
                    >
                        "IN AN ERA OF NOISE, WE CHOOSE THE BEAUTY OF THE VOID."
                    </motion.h2>
                    <div className="h-px w-24 bg-secondary/20 mx-auto" />
                </section>
            </div>
        </div>
    )
}

export default AboutPage
