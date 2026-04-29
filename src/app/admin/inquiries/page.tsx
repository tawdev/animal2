'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/app/lib/api';
import { useNotification } from '@/app/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, 
    User, 
    Calendar, 
    Trash2, 
    CheckCircle, 
    Clock, 
    Search,
    MessageSquare,
    ExternalLink,
    Filter
} from 'lucide-react';

interface Inquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    createdAt: string;
}

export default function AdminInquiriesPage() {
    const { showToast } = useNotification();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getInquiries();
            setInquiries(data);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors du chargement des messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.updateInquiryStatus(id, status);
            setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: status as any } : item));
            if (selectedInquiry?.id === id) {
                setSelectedInquiry(prev => prev ? { ...prev, status: status as any } : null);
            }
            showToast('Statut mis à jour', 'success');
        } catch (err) {
            showToast('Erreur lors de la mise à jour', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
        try {
            await api.deleteInquiry(id);
            setInquiries(prev => prev.filter(item => item.id !== id));
            if (selectedInquiry?.id === id) setSelectedInquiry(null);
            showToast('Message supprimé', 'success');
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const filteredInquiries = inquiries.filter(item => {
        const matchesFilter = filter === 'all' || item.status === filter;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                             item.email.toLowerCase().includes(search.toLowerCase()) ||
                             item.subject.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'read': return 'bg-slate-50 text-slate-600 border-slate-100';
            case 'replied': return 'bg-green-50 text-green-600 border-green-100';
            case 'archived': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Messages <span className="text-primary">Contact</span></h2>
                        <p className="text-slate-500 mt-1 font-medium italic">Gérez les demandes de vos clients et experts.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
                    {/* List View */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                                />
                            </div>
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="h-12 px-4 rounded-2xl border border-slate-200 bg-white focus:border-primary outline-none text-sm font-bold"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="new">Nouveaux</option>
                                <option value="read">Lus</option>
                                <option value="replied">Répondus</option>
                                <option value="archived">Archivés</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
                            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="p-4 animate-pulse space-y-3">
                                            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                                            <div className="h-3 bg-slate-50 rounded w-2/3"></div>
                                        </div>
                                    ))
                                ) : filteredInquiries.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                                        <MessageSquare size={48} className="opacity-10 mb-4" />
                                        <p className="font-bold italic">Aucun message trouvé</p>
                                    </div>
                                ) : (
                                    filteredInquiries.map((item) => (
                                        <button 
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedInquiry(item);
                                                if (item.status === 'new') handleUpdateStatus(item.id, 'read');
                                            }}
                                            className={`w-full text-left p-5 rounded-3xl transition-all mb-2 group border ${selectedInquiry?.id === item.id 
                                                ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' 
                                                : 'bg-white border-transparent hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <h4 className={`text-[15px] font-black truncate ${selectedInquiry?.id === item.id ? 'text-primary' : 'text-slate-900'}`}>
                                                {item.subject}
                                            </h4>
                                            <p className="text-[13px] text-slate-500 font-medium truncate mb-1">{item.name}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail View */}
                    <AnimatePresence mode="wait">
                        {selectedInquiry ? (
                            <motion.div 
                                key={selectedInquiry.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[670px]"
                            >
                                <div className="p-8 border-b border-slate-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(selectedInquiry.status)}`}>
                                            {selectedInquiry.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleUpdateStatus(selectedInquiry.id, 'replied')}
                                                className="p-2.5 rounded-xl hover:bg-green-50 text-green-600 transition-colors"
                                                title="Marquer comme répondu"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(selectedInquiry.id, 'archived')}
                                                className="p-2.5 rounded-xl hover:bg-orange-50 text-orange-600 transition-colors"
                                                title="Archiver"
                                            >
                                                <Clock size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(selectedInquiry.id)}
                                                className="p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 italic mb-4">{selectedInquiry.subject}</h3>
                                    
                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                                                <p className="text-sm font-bold text-slate-900">{selectedInquiry.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                                <p className="text-sm font-bold text-slate-900">{selectedInquiry.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-slate-50/50">
                                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                        <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                                            {selectedInquiry.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
                                    <a 
                                        href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                        className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all"
                                    >
                                        <Mail size={20} />
                                        Répondre par Email
                                    </a>
                                    <a 
                                        href={`https://wa.me/?text=${encodeURIComponent(`Bonjour ${selectedInquiry.name}, concernant votre message : "${selectedInquiry.subject}"`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-14 px-8 bg-[#25D366] hover:bg-[#20ba59] text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all"
                                    >
                                        <ExternalLink size={20} />
                                        WhatsApp
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-400 p-12">
                                <MessageSquare size={64} className="opacity-10 mb-6" />
                                <h3 className="text-xl font-black italic mb-2 uppercase">Sélectionnez un message</h3>
                                <p className="text-sm font-medium italic">Choisissez un message dans la liste pour voir les détails et répondre.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
