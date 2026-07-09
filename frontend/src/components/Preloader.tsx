'use client';

import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Smoothly fade out the preloader after 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div 
            suppressHydrationWarning
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            <div suppressHydrationWarning className="flex flex-col items-center gap-2">
                <h2 className="text-4xl md:text-6xl font-bold animate-sweep-text tracking-wider">
                    CSV Importer
                </h2>
            </div>
        </div>
    );
};
