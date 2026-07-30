import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { useTodoStore } from '../store/useTodoStore';
import { LayoutDashboard, CheckSquare, Mic, User, Users, Plus, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const { activeTab, setActiveTab, openContactModal, openTodoModal } = useUIStore();
    const contacts = useContactStore((state) => state.contacts);
    const todos = useTodoStore((state) => state.todos);

    const pendingTodosCount = todos.filter((t) => !t.completed).length;

    const navItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'todos', label: 'Todo List', icon: CheckSquare, badge: pendingTodosCount > 0 ? pendingTodosCount : null },
        { id: 'voice-notes', label: 'Voice Notes', icon: Mic },
        { id: 'contacts', label: 'Contacts Detail', icon: Users, badge: contacts.length },
        { id: 'profile', label: 'Profile Settings', icon: User },
    ];

    return (
        <aside className="desktop-sidebar" style={{
            width: '260px',
            background: 'var(--surface-container-lowest)',
            borderRight: '1px solid var(--border)',
            padding: '1.5rem 1rem',
            gap: '1.75rem',
            position: 'sticky',
            top: 0,
            height: '100vh',
            flexShrink: 0
        }}>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                }}>
                    <Sparkles size={22} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--accent)' }}>
                        ConvoPilot
                    </h1>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Clean Edition
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('meeting')}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.85rem' }}
                >
                    <Mic size={16} /> GO LIVE SESSION
                </button>
                <button
                    onClick={openTodoModal}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
                >
                    <Plus size={16} /> Add Task
                </button>
            </div>

            {/* Main Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem 0.4rem 0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    Main Menu
                </p>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.7rem 0.85rem',
                                borderRadius: 'var(--radius-lg)',
                                background: isActive ? 'rgba(0, 107, 92, 0.1)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Icon size={18} color={isActive ? 'var(--accent)' : 'currentColor'} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge !== null && item.badge !== undefined && (
                                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
