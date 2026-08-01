'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Menu, Home, Store, ShieldCheck, Info, Mail, ChevronRight, X, Heart, GitCompare, ShoppingBag, Newspaper, ChevronDown, Truck, Search } from 'lucide-react';
import { api, type Category } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {

    const pathname = usePathname();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileExpandedCat, setMobileExpandedCat] = useState<number | null>(null);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [hoveredSubCatId, setHoveredSubCatId] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { settings } = useSettings();

    const { count: wishlistCount } = useWishlist();
    const { count: compareCount } = useCompare();
    const { totalItems } = useCart();

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        const handleOpenMenu = () => setIsMobileMenuOpen(true);
        document.addEventListener('open-mobile-menu', handleOpenMenu);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('open-mobile-menu', handleOpenMenu);
        };
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        api.getCategories(true).then(setCategories).catch(console.error);
    }, []);

    const categoryTree = useMemo(() => {
        const buildTree = (items: Category[], parentId: number | null = null): Category[] => {
            return items
                .filter(item =>
                    item.parentId === parentId &&
                    (item.products?.length || item.children?.some(child => child.products?.length))
                )
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };
        return buildTree(categories);
    }, [categories]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setHoveredCatId(null);
                setHoveredSubCatId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hoveredCategory = categoryTree.find(c => c.id === hoveredCatId);
    const hoveredSubCategory = hoveredCategory?.children?.find(c => c.id === hoveredSubCatId);

    const navItems = [
        { name: 'Accueil', href: '/', icon: <Home size={18} /> },
        { name: 'Boutique', href: '/products', icon: <Store size={18} /> },
        { name: 'Nos Marques', href: '/marques', icon: <ShieldCheck size={18} /> },
        { name: 'À Propos', href: '/about', icon: <Info size={18} /> },
        { name: 'Contact', href: '/contact', icon: <Mail size={18} /> },
        { name: 'Blog', href: '/blog', icon: <Newspaper size={18} /> },
        { name: 'Suivi', href: '/track', icon: <Truck size={18} /> },
    ];

    return (
        <nav className={`w-full sticky top-0 ${isMobileMenuOpen || isScrolled ? 'z-[9999]' : 'z-[2000]'} transition-all duration-500 print:hidden ${isScrolled ? 'py-2' : 'py-4 sm:py-6'}`} suppressHydrationWarning>
            <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
                {/* Mobile Sticky Navbar - Fixed at top when scrolled */}
                <div
                    className={`md:hidden fixed top-0 left-0 right-0 h-[64px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.1)] border-b border-slate-100 flex items-center justify-between px-4 z-[9999] transition-all duration-300 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
                    suppressHydrationWarning
                >
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-slate-800 hover:text-[#1A5319] transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <Link href="/" className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                        <div className="relative w-[110px] h-[44px]">
                            {mounted && (
                                <Image
                                    src={settings?.logoUrl || '/logo.png'}
                                    alt={settings?.storeName || 'Animal Food Express'}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    unoptimized
                                    priority
                                />
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-1">
                        <Link href="/products" className="p-2 text-slate-800 hover:text-[#1A5319]">
                            <Search size={22} />
                        </Link>
                        <Link href="/cart" className="p-2 text-slate-800 hover:text-[#1A5319] relative">
                            <ShoppingBag size={22} />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A5319] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? totalItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Desktop Navbar */}
                <div className={`hidden md:flex items-center rounded-2xl transition-all duration-500 backdrop-blur-2xl border pr-6 shadow-2xl ${isScrolled ? 'h-[72px] p-2 bg-white/80 border-[#1A5319]/20 shadow-slate-200/50' : 'h-[92px] p-4 bg-white/40 border-white/30 shadow-none'}`}>

                    <AnimatePresence>
                        {isScrolled && (
                            <motion.div
                                initial={{ width: 0, opacity: 0, x: -20 }}
                                animate={{ width: 160, opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="flex items-center mr-6 overflow-hidden"
                            >
                                <Link href="/" className="shrink-0 flex items-center w-full h-full">
                                    <div className="relative w-full h-[52px]">
                                        {mounted && (
                                            <Image
                                                src={settings?.logoUrl || '/logo.png'}
                                                alt={settings?.storeName || 'Animal Food Express'}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                unoptimized
                                                priority
                                            />
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen);
                                setHoveredCatId(null);
                                setHoveredSubCatId(null);
                            }}
                            className={`flex items-center justify-between gap-4 bg-[#1A5319] px-5 ${isScrolled ? 'h-[44px]' : 'h-[50px]'} text-white font-bold text-[13px] uppercase tracking-wider rounded-[8px] hover:bg-opacity-95 transition-all group min-w-[240px]`}
                        >
                            TOUTES LES CATÉGO...
                            {isMenuOpen ? (
                                <X size={18} className="transition-transform" />
                            ) : (
                                <Menu size={18} className="group-hover:scale-110 transition-transform" />
                            )}
                        </button>

                        {/* Mega Menu Dropdown */}
                        {isMenuOpen && (
                            <div
                                className="absolute top-[calc(100%+14px)] left-0 z-[100] flex animate-in fade-in slide-in-from-top-2 duration-200"
                                onMouseLeave={() => {
                                    setIsMenuOpen(false);
                                    setHoveredCatId(null);
                                    setHoveredSubCatId(null);
                                }}
                            >
                                <div className="relative w-[250px] h-fit bg-white rounded-2xl shadow-sm py-4 flex flex-col z-30">
                                    <div className="absolute -top-[10px] left-10 w-5 h-5 bg-white rotate-45 rounded-[3px] shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)] z-0"></div>
                                    <div className="relative z-10">
                                        {categoryTree.map((cat) => {
                                            const hasChildren = cat.children && cat.children.length > 0;
                                            const isHovered = hoveredCatId === cat.id;
                                            return (
                                                <Link
                                                    key={cat.id}
                                                    href={`/products?categoryId=${cat.id}`}
                                                    onMouseEnter={() => {
                                                        setTimeout(() => {
                                                            setHoveredCatId(cat.id);
                                                            setHoveredSubCatId(null);
                                                        }, 100);
                                                    }}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`relative flex items-center justify-between px-6 py-[12px] text-[15px] transition-all duration-200 ${isHovered
                                                        ? 'text-[#1A5319] font-semibold bg-slate-50/40'
                                                        : 'text-[#333] font-medium hover:text-[#1A5319]'
                                                        }`}
                                                >
                                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-7 rounded-r-full transition-all duration-200 ${isHovered ? 'bg-[#1A5319] opacity-100' : 'bg-transparent opacity-0'}`}></div>
                                                    <div className="flex items-center gap-4">
                                                        <span>{cat.name}</span>
                                                    </div>
                                                    {hasChildren && (
                                                        <ChevronRight size={16} strokeWidth={isHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isHovered ? 'text-[#1A5319]' : 'text-[#ccc]'}`} />
                                                    )}
                                                </Link>
                                            );
                                        })}

                                        <div className="border-t border-slate-200 my-2 mx-6"></div>

                                        <Link
                                            href="/products?sort=newest"
                                            onClick={() => setIsMenuOpen(false)}
                                            onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                            className="flex items-center px-12 py-[12px] text-[15px] font-semibold text-[#333] hover:text-[#1A5319] bg-transparent hover:bg-slate-50/40 transition-colors"
                                        >
                                            Nouveautés
                                        </Link>
                                        <Link
                                            href="/products?onSale=true"
                                            onClick={() => setIsMenuOpen(false)}
                                            onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                            className="flex items-center px-12 py-[12px] text-[15px] font-semibold text-[#333] hover:text-[#1A5319] bg-transparent hover:bg-slate-50/40 transition-colors"
                                        >
                                            Promotions
                                        </Link>
                                    </div>
                                </div>

                                {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 && (
                                    <div className="relative z-20 w-[270px] h-fit bg-white rounded-md shadow-md py-2 border-l border-slate-200 flex flex-col animate-in fade-in slide-in-from-left-6 duration-300 ease-out fill-mode-both mr-[15px] mt-[20px]">
                                        {hoveredCategory.children.map((sub) => {
                                            const hasGrandChildren = sub.children && sub.children.length > 0;
                                            const isSubHovered = hoveredSubCatId === sub.id;
                                            return (
                                                <Link
                                                    key={sub.id}
                                                    href={`/products?categoryId=${sub.id}`}
                                                    onMouseEnter={() => {
                                                        setTimeout(() => {
                                                            setHoveredSubCatId(sub.id);
                                                        }, 100);
                                                    }}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`flex items-center justify-between px-6 py-[12px] text-[13px] transition-all duration-200 ${isSubHovered
                                                        ? 'text-[#1A5319] font-semibold bg-slate-50/60 rounded-r-lg'
                                                        : 'text-[#5A626A] font-medium hover:text-[#1A5319] hover:bg-slate-50/30'
                                                        }`}
                                                >
                                                    <span>{sub.name}</span>
                                                    {hasGrandChildren && (
                                                        <ChevronRight size={16} strokeWidth={isSubHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isSubHovered ? 'text-[#1A5319]' : 'text-transparent'}`} />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {hoveredSubCategory && hoveredSubCategory.children && hoveredSubCategory.children.length > 0 && (
                                    <div className="relative z-10 w-[260px] h-fit bg-white rounded-r-2xl shadow-[8px_12px_40px_rgba(0,0,0,0.06)] py-4 -ml-4 pl-4 border-l border-slate-200 flex flex-col animate-in fade-in slide-in-from-left-6 duration-300 ease-out fill-mode-both">
                                        {hoveredSubCategory.children.map((grandChild) => (
                                            <Link
                                                key={grandChild.id}
                                                href={`/products?categoryId=${grandChild.id}`}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center px-6 py-[12px] text-[15px] transition-all duration-200 text-[#5A626A] font-medium hover:text-[#1A5319] hover:bg-slate-50/60 rounded-r-lg"
                                            >
                                                {grandChild.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center ml-6 gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-2.5 px-4 ${isScrolled ? 'py-2' : 'py-2.5'} text-[14px] font-bold transition-all rounded-lg
                                        ${isActive ? 'text-[#1A5319]' : 'text-slate-800 hover:text-[#1A5319] hover:bg-slate-50'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navHeaderActive"
                                            className="absolute inset-0 bg-slate-50 rounded-lg z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? 'text-[#1A5319]' : 'text-slate-900'} transition-colors opacity-90`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Action Icons - Always visible since header is no longer sticky */}
                    <div className="flex items-center gap-5 ml-auto mr-4">
                        {/* Search icon - only shows when scrolled (header hidden) */}
                        <Link
                            href="/products"
                            className={`group transition-all duration-300 ${isScrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        >
                            <Search size={20} className="text-slate-900 transition-colors group-hover:text-[#1A5319]" />
                        </Link>
                        <Link href="/compare" className="group relative transition-all">
                            <GitCompare size={20} className="text-slate-900 transition-colors group-hover:text-[#1A5319]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A5319] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? compareCount : 0}
                            </span>
                        </Link>
                        <Link href="/wishlist" className="group relative transition-all">
                            <Heart size={20} className="text-slate-900 transition-colors group-hover:text-[#1A5319]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A5319] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? wishlistCount : 0}
                            </span>
                        </Link>
                        <Link href="/cart" className="group relative transition-all">
                            <ShoppingBag size={20} className="text-slate-900 transition-colors group-hover:text-[#1A5319]" />
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A5319] text-[9px] font-black text-white ring-2 ring-white">
                                {mounted ? totalItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Backdrop */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9998] animate-in fade-in duration-300 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Menu Side Drawer */}
                <div
                    className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[9999] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden overflow-y-auto custom-scrollbar ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-[#1A5319] text-white">
                            <h2 className="text-[17px] font-black uppercase tracking-widest">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="p-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all ${isActive ? 'bg-[#1A5319]/10 text-[#1A5319]' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive ? 'text-[#1A5319]' : 'text-slate-400'}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="h-[1px] w-full bg-slate-200 my-4 px-8" />

                        {/* Categories Accordion */}
                        <div className="p-4 pt-0">
                            <h3 className="px-4 py-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Les Catégories</h3>
                            <div className="space-y-1">
                                {categoryTree.map((cat) => {
                                    const isExpanded = mobileExpandedCat === cat.id;
                                    const hasChildren = cat.children && cat.children.length > 0;

                                    return (
                                        <div key={cat.id} className="overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`/products?categoryId=${cat.id}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex-1 px-4 py-3 text-[14px] font-semibold text-slate-800 hover:text-[#1A5319] transition-colors"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {hasChildren && (
                                                    <button
                                                        onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                                                        className={`p-3 text-slate-400 hover:text-[#1A5319] transition-all ${isExpanded ? 'rotate-180' : ''}`}
                                                    >
                                                        <ChevronDown size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            {hasChildren && (
                                                <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden bg-slate-50/50 rounded-xl ml-4">
                                                        {cat.children!.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                href={`/products?categoryId=${sub.id}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="block px-8 py-2.5 text-[13px] font-medium text-slate-600 hover:text-[#1A5319]"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto p-8 bg-slate-50">
                            <div className="flex items-center gap-4 mb-6">
                                <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="relative flex-1 flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <Heart size={20} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-600">Souhaits</span>
                                    <span className="absolute top-2 right-4 bg-[#1A5319] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{mounted ? wishlistCount : 0}</span>
                                </Link>
                                <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="relative flex-1 flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <GitCompare size={20} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-600">Comparer</span>
                                    <span className="absolute top-2 right-4 bg-[#1A5319] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{mounted ? compareCount : 0}</span>
                                </Link>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium text-center">
                                CDigital © {mounted ? new Date().getFullYear() : '2026'} — PetMarket
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
