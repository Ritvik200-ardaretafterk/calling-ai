import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { useTodoStore } from '../store/useTodoStore';
import { LayoutDashboard, CheckSquare, Mic, User, Plus } from 'lucide-react';

export default function MobileNav() {
    const { activeTab, setActiveTab, openQuickActionSheet } = useUIStore();
    const todos = useTodoStore((s) => s.todos);
    const pendingCount = todos.filter((t) => !t.completed).length;

    const leftTabs = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'todos', label: 'Todo', icon: CheckSquare, badge: pendingCount || null },
    ];

    const rightTabs = [
        { id: 'voice-notes', label: 'Voice Notes', icon: Mic },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <nav id="tour-mobile-nav" className="mobile-nav">
            {leftTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                    <button
                        key={t.id}
                        className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? 'var(--accent)' : 'var(--text-secondary)'} />
                        <span>{t.label}</span>
                    </button>
                );
            })}

            <div className="nav-fab-wrapper">
                <button
                    id="tour-quick-fab"
                    className="nav-fab"
                    onClick={openQuickActionSheet}
                    title="Quick Actions"
                >
                    <Plus size={24} strokeWidth={2.5} color="#ffffff" />
                </button>
            </div>

            {rightTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                    <button
                        key={t.id}
                        className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? 'var(--accent)' : 'var(--text-secondary)'} />
                        <span>{t.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
