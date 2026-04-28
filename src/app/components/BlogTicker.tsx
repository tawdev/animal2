'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
    'CONSEILS SOINS',
    'NUTRITION PETS',
    'PETMARKET MAROC',
    'CONSEILS SOINS',
    'NUTRITION PETS',
    'PETMARKET MAROC',
    'CONSEILS SOINS',
    'NUTRITION PETS',
    'PETMARKET MAROC',
    'CONSEILS SOINS',
    'NUTRITION PETS',
    'PETMARKET MAROC',
];

export default function BlogTicker() {
    return (
        <div className="bg-[#1A5319] py-2 overflow-hidden whitespace-nowrap border-y border-white/10 relative z-20">
            <div className="flex animate-marquee gap-16 items-center">
                {/* Double the items to ensure seamless loop */}
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <div key={i} className="flex items-center gap-16 group">
                        <span className="text-white font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-6">
                            {item} 
                            <Sparkles size={14} className="text-white/40 group-hover:scale-125 transition-transform" strokeWidth={3} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
