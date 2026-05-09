import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const ImageWithLoader = ({ src, alt, className = '', onClick, draggable, ...rest }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
            {!loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
                    <Loader2 className="animate-spin text-secondary/40" size={28} strokeWidth={1} />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/5 text-[10px] uppercase tracking-widest text-secondary/40">
                    Image unavailable
                </div>
            )}
            <img
                src={src}
                alt={alt}
                draggable={draggable}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                {...rest}
            />
        </div>
    );
};

export default ImageWithLoader;
