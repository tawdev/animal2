'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

import { Lock, Mail, ShieldCheck, Eye, EyeOff, LogIn } from 'lucide-react';

function AdminLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { login, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/admin';

    // If already logged in as admin/manager, redirect
    useEffect(() => {
        if (!authLoading && user) {
            const role = user.role;
            if (role === 'admin') router.replace('/admin');
            else if (role === 'stock_manager') router.replace('/admin/inventory');
            else if (role === 'order_manager') router.replace('/admin/orders');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Email ou mot de passe incorrect');
            }

            const { role } = data.user;

            // Block customers from accessing admin
            if (role === 'customer') {
                throw new Error("Accès refusé. Vous n'êtes pas autorisé à accéder au panel admin.");
            }

            login(data.access_token, data.user);

            // Role-based redirect
            if (role === 'stock_manager') router.push('/admin/inventory');
            else if (role === 'order_manager') router.push('/admin/orders');
            else router.push(redirectTo);
        } catch (err: any) {
            setError(err.message || "Erreur d'authentification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-[#0ea5e9]/20 selection:text-[#0ea5e9]">
            <div className="w-full max-w-[400px]">
                {/* Subtle glow effect behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden z-10 transition-all duration-500">
                    {/* Logo / Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl shadow-inner mb-6">
                            <ShieldCheck className="text-[#0ea5e9] w-7 h-7" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Accès Admin</h1>
                        <p className="text-slate-500 text-xs font-medium mt-1">Authentification personnel requise</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="email@exemple.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0ea5e9] transition-colors" size={18} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Mot de passe"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all outline-none text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center animate-in fade-in slide-in-from-top-2">
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-slate-800 disabled:text-slate-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <LogIn className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <AdminLoginForm />
        </Suspense>
    );
}
