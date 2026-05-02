'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type AdminUser, type AdminRole } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; icon: string }> = {
    admin: {
        label: 'Super Admin',
        color: 'bg-violet-100 text-violet-700',
        icon: 'admin_panel_settings',
    },
    stock_manager: {
        label: 'Gestionnaire Stock',
        color: 'bg-blue-100 text-blue-700',
        icon: 'inventory',
    },
    order_manager: {
        label: 'Gestionnaire Commandes',
        color: 'bg-amber-100 text-amber-700',
        icon: 'shopping_cart',
    },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function UserFormModal({
    user,
    onClose,
    onSave,
}: {
    user: AdminUser | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}) {
    const isEdit = !!user;
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        password: '',
        role: (user?.role || 'stock_manager') as AdminRole,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = { fullName: form.fullName, email: form.email, role: form.role };
            if (form.password) payload.password = form.password;
            if (!isEdit) payload.password = form.password; // required on create
            await onSave(payload);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">
                            {isEdit ? 'Modifier le compte' : 'Nouveau compte'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isEdit ? `Édition de ${user?.fullName}` : 'Créer un gestionnaire'}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nom complet</label>
                        <input
                            type="text"
                            required
                            value={form.fullName}
                            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                            className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: Mohamed Alami"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            disabled={isEdit}
                            className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-slate-50"
                            placeholder="email@exemple.com"
                        />
                        {isEdit && <p className="text-xs text-slate-400 mt-1">L&apos;email ne peut pas être modifié</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                        </label>
                        <input
                            type="password"
                            required={!isEdit}
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder={isEdit ? 'Laisser vide pour ne pas changer' : '••••••••'}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Rôle</label>
                        <div className="mt-1.5 grid grid-cols-1 gap-2">
                            {(Object.entries(ROLE_CONFIG) as [AdminRole, typeof ROLE_CONFIG[AdminRole]][])
                                .filter(([r]) => r !== 'admin')
                                .map(([roleKey, config]) => (
                                    <label key={roleKey} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === roleKey ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input type="radio" name="role" value={roleKey} checked={form.role === roleKey} onChange={() => setForm(f => ({ ...f, role: roleKey }))} className="hidden" />
                                        <span className={`material-symbols-outlined text-[20px] p-1.5 rounded-lg ${config.color}`}>{config.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{config.label}</p>
                                            <p className="text-xs text-slate-500">
                                                {roleKey === 'stock_manager' ? 'Accès : Inventaire uniquement' : 'Accès : Commandes uniquement'}
                                            </p>
                                        </div>
                                        {form.role === roleKey && (
                                            <span className="material-symbols-outlined text-primary ml-auto text-[20px]">check_circle</span>
                                        )}
                                    </label>
                                ))
                            }
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">{isEdit ? 'save' : 'person_add'}</span>
                            )}
                            {saving ? 'Sauvegarde...' : (isEdit ? 'Sauvegarder' : 'Créer le compte')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const { showToast } = useNotification();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalUser, setModalUser] = useState<AdminUser | null | 'new'>('new' as any);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Reset modal closed state
    const openCreate = () => { setModalUser(null); setModalOpen(true); };
    const openEdit = (u: AdminUser) => { setModalUser(u); setModalOpen(true); };
    const closeModal = () => setModalOpen(false);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers();
            setUsers(data);
        } catch {
            showToast('Impossible de charger les utilisateurs', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleSave = async (data: any) => {
        try {
            if (modalUser) {
                await api.updateAdminUser((modalUser as AdminUser).id, data);
                showToast('Compte mis à jour', 'success');
            } else {
                await api.createAdminUser(data);
                showToast('Compte créé avec succès', 'success');
            }
            loadUsers();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la sauvegarde', 'error');
            throw err;
        }
    };

    const handleToggle = async (u: AdminUser) => {
        try {
            setTogglingId(u.id);
            await api.toggleAdminUserActive(u.id);
            showToast(`Compte ${u.isActive ? 'désactivé' : 'activé'}`, 'success');
            loadUsers();
        } catch (err: any) {
            showToast(err.message || 'Erreur', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (u: AdminUser) => {
        if (!confirm(`Supprimer définitivement le compte de ${u.fullName} ?`)) return;
        try {
            setDeletingId(u.id);
            await api.deleteAdminUser(u.id);
            showToast('Compte supprimé', 'success');
            setUsers(prev => prev.filter(x => x.id !== u.id));
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la suppression', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // Stats summary
    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        stockManagers: users.filter(u => u.role === 'stock_manager').length,
        orderManagers: users.filter(u => u.role === 'order_manager').length,
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-white">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Comptes</h2>
                        <p className="text-slate-500 mt-1 font-medium text-[15px]">Créez et gérez les accès de votre équipe.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Nouveau compte
                    </button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total comptes', value: stats.total, icon: 'group', color: 'bg-slate-100 text-slate-600' },
                        { label: 'Actifs', value: stats.active, icon: 'check_circle', color: 'bg-emerald-100 text-emerald-600' },
                        { label: 'Stock', value: stats.stockManagers, icon: 'inventory', color: 'bg-blue-100 text-blue-600' },
                        { label: 'Commandes', value: stats.orderManagers, icon: 'shopping_cart', color: 'bg-amber-100 text-amber-600' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Permissions info banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-[22px] mt-0.5">info</span>
                    <div className="text-sm text-blue-700">
                        <p className="font-bold mb-1">Permissions par rôle :</p>
                        <ul className="space-y-0.5 font-medium">
                            <li>🟣 <strong>Super Admin</strong> — Accès complet à tout le panel</li>
                            <li>🔵 <strong>Gestionnaire Stock</strong> — Accès uniquement à Inventaire &amp; Produits</li>
                            <li>🟡 <strong>Gestionnaire Commandes</strong> — Accès uniquement aux Commandes</li>
                        </ul>
                    </div>
                </div>

                {/* Users table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="size-12 bg-slate-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-48" />
                                        <div className="h-3 bg-slate-100 rounded w-36" />
                                    </div>
                                    <div className="h-6 bg-slate-200 rounded-full w-28" />
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <span className="material-symbols-outlined text-6xl opacity-20 block mb-3">group</span>
                            <p className="font-bold text-lg text-slate-500">Aucun compte gestionnaire</p>
                            <p className="text-sm mt-1">Créez votre premier compte pour donner accès à votre équipe</p>
                            <button onClick={openCreate} className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                                Créer un compte
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {users.map(u => {
                                const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG['stock_manager'];
                                const initials = u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const isSelf = currentUser?.id === u.id;

                                return (
                                    <div key={u.id} className={`flex items-center gap-4 px-6 py-4 transition-colors group ${u.isActive ? 'hover:bg-slate-50/70' : 'opacity-60 bg-slate-50/50'}`}>
                                        {/* Avatar */}
                                        <div className={`size-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${u.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                                            {initials}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-slate-900 text-[15px]">{u.fullName}</p>
                                                {isSelf && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded">Vous</span>
                                                )}
                                                {!u.isActive && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded">Désactivé</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{u.email}</p>
                                        </div>

                                        {/* Role badge */}
                                        <span className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${roleConf.color}`}>
                                            <span className="material-symbols-outlined text-[14px]">{roleConf.icon}</span>
                                            {roleConf.label}
                                        </span>

                                        {/* Date */}
                                        <span className="hidden lg:block text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                                        </span>

                                        {/* Actions */}
                                        {!isSelf && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(u)}
                                                    disabled={togglingId === u.id}
                                                    className={`size-8 flex items-center justify-center rounded-lg transition-colors ${u.isActive ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-emerald-50 text-emerald-500'}`}
                                                    title={u.isActive ? 'Désactiver' : 'Activer'}
                                                >
                                                    {togglingId === u.id ? (
                                                        <div className="size-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[18px]">{u.isActive ? 'block' : 'check_circle'}</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    disabled={deletingId === u.id}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    {deletingId === u.id ? (
                                                        <div className="size-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <UserFormModal
                    user={modalUser as AdminUser | null}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </main>
    );
}
