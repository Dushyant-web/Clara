import React, { useEffect, useState } from 'react';

let activeRequests = 0;
const listeners = new Set();

const notify = () => listeners.forEach((cb) => cb(activeRequests));

export const startLoading = () => {
    activeRequests += 1;
    notify();
};

export const stopLoading = () => {
    activeRequests = Math.max(0, activeRequests - 1);
    notify();
};

const TopLoadingBar = () => {
    const [count, setCount] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = (n) => setCount(n);
        listeners.add(update);
        return () => listeners.delete(update);
    }, []);

    useEffect(() => {
        let interval;
        if (count > 0) {
            setProgress(10);
            interval = setInterval(() => {
                setProgress((p) => (p < 85 ? p + (85 - p) * 0.1 : p));
            }, 200);
        } else if (progress > 0) {
            setProgress(100);
            const t = setTimeout(() => setProgress(0), 400);
            return () => clearTimeout(t);
        }
        return () => interval && clearInterval(interval);
    }, [count]);

    if (progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 z-[9999] h-[2px] bg-secondary transition-all duration-200 ease-out"
            style={{
                width: `${progress}%`,
                opacity: progress === 100 ? 0 : 1,
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
        />
    );
};

export default TopLoadingBar;
