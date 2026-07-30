import React, { useState } from 'react';
import { useContactStore } from '../store/useContactStore';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { useTodoStore } from '../store/useTodoStore';
import { useUIStore } from '../store/useUIStore';
import { Plus, Edit3, Trash2, Mail, Phone, MessageCircle, CheckSquare, ChevronLeft, FileText, Check, X, Search, Users, PlayCircle, Calendar } from 'lucide-react';

export default function ContactsPage({ searchTerm = '' }) {
    const contacts = useContactStore((s) => s.contacts);
    const deleteContact = useContactStore((s) => s.deleteContact);
    const updateContact = useContactStore((s) => s.updateContact);
    const keyPoints = useKeyPointStore((s) => s.keyPoints);
    const { toggleCovered, deleteKeyPoint } = useKeyPointStore();
    const todos = useTodoStore((s) => s.todos);
    const { openContactModal, openKeyPointModal, openTodoModal, showToast, setActiveTab, activeContactIdFilter } = useUIStore();

    const [selectedId, setSelectedId] = useState(activeContactIdFilter || null);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesText, setNotesText] = useState('');
    const [localSearch, setLocalSearch] = useState('');

    const query = (searchTerm || localSearch).toLowerCase();
    const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.company && c.company.toLowerCase().includes(query))
    );

    const selected = contacts.find((c) => c.id === selectedId);
    const contactKP = selected ? keyPoints.filter((k) => k.contact_id === selected.id) : [];
    const contactTodos = selected ? todos.filter((t) => t.contact_id === selected.id) : [];

    const coveredKPCount = contactKP.filter((k) => k.covered).length;
    const totalKPCount = contactKP.length;
    const progressPercent = totalKPCount > 0 ? (coveredKPCount / totalKPCount) * 100 : 0;

    // Contact Detail View (Matching Stitch Clean Layout)
    if (selected) {
        return (
            <div className="flex flex-col gap-6 pb-28 animate-in fade-in duration-300">
                {/* Top Bar Navigation */}
                <button
                    onClick={() => setSelectedId(null)}
                    className="self-start flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
                >
                    <ChevronLeft size={18} /> Back to Contacts
                </button>

                {/* Profile Header Section */}
                <section className="flex flex-col items-center text-center gap-3 py-4">
                    <div className="w-28 h-28 rounded-full bg-emerald-700 text-white font-bold text-3xl flex items-center justify-center shadow-lg ring-4 ring-white mb-2">
                        {selected.name.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-headline">{selected.name}</h1>
                    <p className="text-sm text-gray-500 font-medium max-w-xs">
                        {selected.role || selected.company || 'Contact Partner'}
                        <br />
                        <span className="text-xs opacity-75">Last contacted recently</span>
                    </p>
                    <div className="mt-2">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-100">
                            <Calendar size={14} /> Upcoming: Timeline Review
                        </div>
                    </div>
                </section>

                {/* Key Points Checklist Section */}
                <section className="card p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 font-headline">Key Points</h2>
                        <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">
                            {totalKPCount} Tasks
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-600 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-emerald-800 whitespace-nowrap">
                            {coveredKPCount} / {totalKPCount} covered
                        </span>
                    </div>

                    {/* Checklist Items */}
                    {contactKP.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">No key points recorded for this contact yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {contactKP.map((kp) => (
                                <label
                                    key={kp.id}
                                    className="flex items-center p-3 gap-3 bg-gray-50/60 hover:bg-gray-100/80 transition-all cursor-pointer rounded-xl"
                                >
                                    <input
                                        type="checkbox"
                                        checked={kp.covered}
                                        onChange={() => {
                                            toggleCovered(kp.id);
                                            showToast(kp.covered ? 'Unmarked' : 'Covered!', 'success');
                                        }}
                                        className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                    />
                                    <span
                                        className={`flex-1 text-sm ${kp.covered ? 'line-through text-gray-400 opacity-60' : 'text-gray-900 font-medium'
                                            }`}
                                    >
                                        {kp.text}
                                    </span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); deleteKeyPoint(kp.id); showToast('Deleted point', 'info'); }}
                                        className="text-gray-400 hover:text-rose-600 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </label>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => openKeyPointModal(null, selected.id)}
                        className="w-full flex items-center justify-center gap-2 text-emerald-700 font-semibold text-xs py-3 rounded-xl hover:bg-emerald-50 transition-colors border border-dashed border-emerald-200 mt-1"
                    >
                        <Plus size={16} /> Add new point
                    </button>
                </section>

                {/* Context & Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Notes Context */}
                    <section className="card p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                                Meeting Context
                            </h3>
                            {!editingNotes ? (
                                <button
                                    onClick={() => { setNotesText(selected.notes || ''); setEditingNotes(true); }}
                                    className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                                >
                                    <Edit3 size={12} /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingNotes(false)} className="text-xs text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                    <button onClick={async () => {
                                        await updateContact(selected.id, { notes: notesText });
                                        setEditingNotes(false);
                                        showToast('Notes saved', 'success');
                                    }} className="text-xs text-emerald-700 font-bold flex items-center gap-1"><Check size={14} /> Save</button>
                                </div>
                            )}
                        </div>

                        {editingNotes ? (
                            <textarea
                                className="form-textarea text-sm"
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                rows={3}
                            />
                        ) : (
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                {selected.notes || 'No notes added. Tap Edit to add key discussion context.'}
                            </p>
                        )}
                    </section>

                    {/* Contact Details */}
                    <section className="card p-5 flex flex-col gap-3">
                        <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                            Contact Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                    <Mail size={16} />
                                </div>
                                <span className="font-medium">{selected.email || 'No email saved'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                    <Phone size={16} />
                                </div>
                                <span className="font-medium">{selected.phone || 'No phone saved'}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Action Button: Start Meeting */}
                <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-30">
                    <div className="max-w-xl mx-auto">
                        <button
                            onClick={() => setActiveTab('meeting', selected.id)}
                            className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-98"
                        >
                            <PlayCircle size={22} />
                            Start Meeting Assistant
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Contact List View (Matching Stitch Clean Layout)
    return (
        <div className="flex flex-col gap-5 pb-20">
            {/* Search Box */}
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                    className="form-input"
                    placeholder="Search contacts by name or company..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
            </div>

            <div className="flex items-end justify-between px-1">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 font-headline">All Contacts</h2>
                    <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
                        {filtered.length} Contact{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => openContactModal()} className="btn btn-primary btn-sm">
                    <Plus size={16} /> New Contact
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="card p-8 text-center text-gray-500 text-sm">
                    No contacts found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((c) => {
                        const pendingCount = keyPoints.filter((k) => k.contact_id === c.id && !k.covered).length;
                        const initials = c.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase();

                        return (
                            <div
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className="card card-interactive p-5 flex flex-col gap-4 group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-sm shadow-sm">
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-700 transition-colors">
                                                {c.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {c.role || c.company || 'Contact'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pendingCount > 0 && (
                                            <span className="badge badge-accent">{pendingCount} Pending</span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Delete ${c.name}?`)) {
                                                    deleteContact(c.id);
                                                    showToast('Deleted', 'info');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-rose-600 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
