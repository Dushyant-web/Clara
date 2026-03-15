import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-[2000] bg-primary flex items-center justify-center">
            <div className="text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="text-4xl md:text-6xl font-serif tracking-tighter text-secondary"
                >
                    GAURK.
                </motion.div>
                <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            className="w-1.5 h-1.5 bg-secondary/20 rounded-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loader;
