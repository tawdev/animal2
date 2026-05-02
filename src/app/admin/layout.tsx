'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../lib/api';

// ─── Nav items with role restrictions ────────────────────────────────────────
// roles: undefined = all admin roles allowed, array = only those roles
const navItems = [
    { label: 'Dashboard',       href: '/admin',              icon: 'dashboard',          roles: ['admin'] },
    { label: 'Products',        href: '/admin/products',     icon: 'inventory_2',        roles: ['admin', 'stock_manager'] },
    { label: 'Categories',      href: '/admin/categories',   icon: 'category',           roles: ['admin', 'stock_manager'] },
    { label: 'Orders',          href: '/admin/orders',       icon: 'shopping_cart',      roles: ['admin', 'order_manager', 'stock_manager'] },
    { label: 'Inventory',       href: '/admin/inventory',    icon: 'inventory',          roles: ['admin', 'stock_manager'], stockAlert: true },
    { label: 'Blog',            href: '/admin/blog',         icon: 'article',            roles: ['admin', 'order_manager'] },
    { label: 'Marques',         href: '/admin/brands',       icon: 'verified',           roles: ['admin'] },
    { label: 'FAQs',            href: '/admin/faqs',         icon: 'quiz',               roles: ['admin'] },
    { label: 'Messages',        href: '/admin/inquiries',    icon: 'chat',               roles: ['admin'] },
    { label: 'Avis Clients',    href: '/admin/reviews',      icon: 'reviews',            roles: ['admin', 'order_manager'] },
    { label: 'Témoignages',     href: '/admin/testimonials', icon: 'format_quote',       roles: ['admin'] },
    { label: 'Analytics',       href: '/admin/analytics',    icon: 'analytics',          roles: ['admin'] },
    { label: 'Utilisateurs',    href: '/admin/users',        icon: 'manage_accounts',    roles: ['admin'] },
    { label: 'Settings',        href: '/admin/settings',     icon: 'settings',           roles: ['admin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Force light mode
    useEffect(() => {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, [pathname]);

    // Load low-stock count for the badge (admin + stock_manager only)
    const loadStockAlert = useCallback(async () => {
        if (!user || (user.role !== 'admin' && user.role !== 'stock_manager')) return;
        try {
            const res = await api.getProducts({ page: 1, limit: 100 });
            const low = res.data.filter(p => p.stock <= 10).length;
            setLowStockCount(low);
        } catch {
            // Silently fail — badge is non-critical
        }
    }, [user]);

    useEffect(() => {
        loadStockAlert();
        // Refresh every 60 seconds
        const interval = setInterval(loadStockAlert, 60_000);
        return () => clearInterval(interval);
    }, [loadStockAlert]);

    // Initials for the avatar
    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';

    // Role label
    const roleLabel: Record<string, string> = {
        admin: 'Super Admin',
        stock_manager: 'Gest. Stock',
        order_manager: 'Gest. Commandes',
        customer: 'Client',
    };

    // Filter nav items visible to the current user's role
    const visibleNavItems = navItems.filter(item => {
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    // If it's the login page, don't render the sidebar layout at all
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="light bg-[#F8FAFC] text-slate-900 antialiased min-h-screen" style={{ '--primary': '#1A5319' } as React.CSSProperties}>
            <div className="flex h-screen overflow-hidden">
                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Drawer */}
                <aside className={`fixed lg:static inset-y-0 left-0 w-72 lg:w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-[50] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="relative shrink-0" style={{ width: 120, height: 48 }}>
                                <img
                                    src={settings?.logoUrl || '/mol.jpeg'}
                                    alt={settings?.storeName || 'PetMarket Admin'}
                                    className="w-full h-full object-contain"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Link>
                        {/* Mobile close button */}
                        <button
                            className="lg:hidden text-slate-400 hover:text-slate-900"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Role banner for non-admin */}
                    {user && user.role !== 'admin' && (
                        <div className="mx-4 mt-3 px-3 py-2 bg-primary/8 border border-primary/20 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[16px]">
                                {user.role === 'stock_manager' ? 'inventory' : 'shopping_cart'}
                            </span>
                            <div>
                                <p className="text-[11px] font-black text-primary">{roleLabel[user.role]}</p>
                                <p className="text-[10px] text-slate-500">Accès limité</p>
                            </div>
                        </div>
                    )}

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-4">
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                            const showBadge = item.stockAlert && lowStockCount > 0;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[24px] transition-colors ${isActive ? 'fill-1' : 'group-hover:text-primary'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-sm tracking-tight flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                                        {item.label}
                                    </span>
                                    {/* Low stock badge */}
                                    {showBadge && (
                                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                                            {lowStockCount}
                                        </span>
                                    )}
                                    {isActive && !showBadge && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(26,83,25,0.4)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User card at bottom */}
                    <div className="p-4 mt-auto border-t border-slate-100">
                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                {initials}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-slate-900 truncate">
                                    {user?.fullName || 'Admin User'}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate">
                                    {roleLabel[user?.role || 'admin']}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                title="Se déconnecter"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Mobile Header Toggle */}
                    <div className="lg:hidden h-14 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 z-40">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span className="ml-3 font-bold text-slate-900">Admin Panel</span>
                        {/* Low stock badge in mobile header */}
                        {lowStockCount > 0 && (
                            <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[14px] animate-pulse">warning</span>
                                {lowStockCount} stock faible
                            </span>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
