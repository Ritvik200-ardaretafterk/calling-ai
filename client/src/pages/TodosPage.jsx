import React, { useState, useEffect } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { useContactStore } from '../store/useContactStore';
import { useUIStore } from '../store/useUIStore';
import {
    Plus, Edit3, Trash2, Search, Calendar, User, CheckCircle2,
    Circle, AlertCircle, Clock, Filter, ArrowUpDown, ChevronDown,
    ChevronUp, Sparkles, Check
} from 'lucide-react';

export default function TodosPage({ searchTerm = '' }) {
    const { todos, fetchTodos, toggleTodoComplete, deleteTodo, addTodo } = useTodoStore();
    const contacts = useContactStore((s) => s.contacts);
    const { openTodoModal, showToast } = useUIStore();

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Quick Add state
    const [quickTitle, setQuickTitle] = useState('');
    const [quickContactId, setQuickContactId] = useState('');
    const [quickDueDate, setQuickDueDate] = useState('');
    const [quickPriority, setQuickPriority] = useState('medium');
    const [showOptions, setShowOptions] = useState(false);

    // Filter & Sort state
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'today' | 'overdue' | 'pending' | 'completed'
    const [contactFilter, setContactFilter] = useState('all');
    const [localSearch, setLocalSearch] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!quickTitle.trim()) return;

        try {
            await addTodo({
                title: quickTitle.trim(),
                contact_id: quickContactId || null,
                due_date: quickDueDate || new Date().toISOString().split('T')[0],
                priority: quickPriority,
                completed: false
            });
            setQuickTitle('');
            setQuickContactId('');
            setQuickDueDate('');
            setShowOptions(false);
            showToast('Task added!', 'success');
        } catch (err) {
            showToast('Failed to add task', 'error');
        }
    };

    // Filter logic
    const query = (searchTerm || localSearch).toLowerCase();
    let filteredList = todos.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );

    if (contactFilter !== 'all') filteredList = filteredList.filter((t) => t.contact_id === contactFilter);

    // Helper for date categorizing
    const getItemCategory = (todo) => {
        if (todo.completed) return 'Completed';
        if (!todo.due_date) return 'No Date';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(todo.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        return 'Upcoming';
    };

    // Apply Tab Filter
    if (statusFilter === 'today') filteredList = filteredList.filter((t) => !t.completed && getItemCategory(t) === 'Today');
    if (statusFilter === 'overdue') filteredList = filteredList.filter((t) => !t.completed && getItemCategory(t) === 'Overdue');
    if (statusFilter === 'pending') filteredList = filteredList.filter((t) => !t.completed);
    if (statusFilter === 'completed') filteredList = filteredList.filter((t) => t.completed);

    // Grouping
    const categoriesOrder = ['Overdue', 'Today', 'Upcoming', 'No Date'];
    const grouped = {
        Overdue: [],
        Today: [],
        Upcoming: [],
        'No Date': [],
        Completed: []
    };

    filteredList.forEach((todo) => {
        const cat = getItemCategory(todo);
        if (grouped[cat]) {
            grouped[cat].push(todo);
        } else {
            grouped['No Date'].push(todo);
        }
    });

    const pendingCount = todos.filter((t) => !t.completed).length;
    const overdueCount = todos.filter((t) => !t.completed && getItemCategory(t) === 'Overdue').length;
    const todayCount = todos.filter((t) => !t.completed && getItemCategory(t) === 'Today').length;
    const completedCount = todos.filter((t) => t.completed).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>

            {/* SLEEK 1-LINE QUICK ADD INPUT */}
            <form
                onSubmit={handleQuickAdd}
                className="glass-card"
                style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: '0 4px 16px rgba(0, 32, 34, 0.06)',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0, 107, 92, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                        <Plus size={18} />
                    </div>
                    <input
                        className="form-input"
                        placeholder="Add a new task... (press Enter)"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onFocus={() => setShowOptions(true)}
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            padding: '0.2rem 0',
                            boxShadow: 'none',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!quickTitle.trim()}
                        className="btn btn-primary"
                        style={{
                            padding: '0.5rem 0.95rem',
                            fontSize: '0.8rem',
                            borderRadius: 'var(--radius-lg)',
                            opacity: quickTitle.trim() ? 1 : 0.4
                        }}
                    >
                        Add
                    </button>
                </div>

                {/* Collapsible Options Row */}
                {showOptions && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed var(--border)',
                        alignItems: 'center'
                    }}>
                        <select
                            className="form-select"
                            value={quickContactId}
                            onChange={(e) => setQuickContactId(e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem', borderRadius: 'var(--radius-md)' }}
                        >
                            <option value="">👤 Link Contact</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            className="form-input"
                            value={quickDueDate}
                            onChange={(e) => setQuickDueDate(e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem', width: 'auto', borderRadius: 'var(--radius-md)' }}
                        />

                        <select
                            className="form-select"
                            value={quickPriority}
                            onChange={(e) => setQuickPriority(e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem', borderRadius: 'var(--radius-md)' }}
                        >
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                    </div>
                )}
            </form>

            {/* QUICK STAT FILTER CHIPS */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                <button
                    className={`pill-tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                    All <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>({todos.length})</span>
                </button>
                <button
                    className={`pill-tab ${statusFilter === 'today' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('today')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                    <Clock size={13} color={statusFilter === 'today' ? '#ffffff' : 'var(--accent)'} /> Today
                    <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>({todayCount})</span>
                </button>
                {overdueCount > 0 && (
                    <button
                        className={`pill-tab ${statusFilter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('overdue')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: statusFilter === 'overdue' ? '#ffffff' : 'var(--rose)' }}
                    >
                        <AlertCircle size={13} color={statusFilter === 'overdue' ? '#ffffff' : 'var(--rose)'} /> Overdue
                        <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>({overdueCount})</span>
                    </button>
                )}
                <button
                    className={`pill-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('completed')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                    <CheckCircle2 size={13} color={statusFilter === 'completed' ? '#ffffff' : 'var(--green)'} /> Done
                    <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>({completedCount})</span>
                </button>
            </div>

            {/* SEARCH & CONTACT FILTER ROW */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        className="form-input"
                        placeholder="Search tasks..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        style={{ paddingLeft: '2.2rem', padding: '0.55rem 0.85rem 0.55rem 2.2rem', fontSize: '0.85rem', borderRadius: 'var(--radius-lg)' }}
                    />
                </div>

                {contacts.length > 0 && (
                    <select
                        className="form-select"
                        value={contactFilter}
                        onChange={(e) => setContactFilter(e.target.value)}
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-lg)' }}
                    >
                        <option value="all">All Contacts</option>
                        {contacts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* TASK LIST GROUPED BY TIME */}
            {filteredList.length === 0 ? (
                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
                    <CheckCircle2 size={40} color="var(--accent)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
                    <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'Manrope, sans-serif' }}>
                        {statusFilter === 'completed' ? 'No Completed Tasks Yet' : statusFilter === 'today' ? 'All Done for Today!' : 'No Tasks Found'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto' }}>
                        Type a task in the quick add bar above to stay organized.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {categoriesOrder.map((category) => {
                        const items = grouped[category];
                        if (!items || items.length === 0) return null;

                        const categoryColors = {
                            Overdue: 'var(--rose)',
                            Today: 'var(--accent)',
                            Upcoming: 'var(--amber)',
                            'No Date': 'var(--text-tertiary)'
                        };

                        const categoryIcons = {
                            Overdue: <AlertCircle size={15} color="var(--rose)" />,
                            Today: <Clock size={15} color="var(--accent)" />,
                            Upcoming: <Calendar size={15} color="var(--amber)" />,
                            'No Date': <Circle size={15} color="var(--text-tertiary)" />
                        };

                        return (
                            <section key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {/* Category Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', paddingLeft: '0.25rem' }}>
                                    {categoryIcons[category]}
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                                        {category}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '0.1rem 0.45rem',
                                        borderRadius: '12px',
                                        background: categoryColors[category] + '15',
                                        color: categoryColors[category]
                                    }}>
                                        {items.length}
                                    </span>
                                </div>

                                {/* Task Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                    {items.map((todo) => {
                                        const linkedContact = contacts.find((c) => c.id === todo.contact_id);

                                        return (
                                            <div
                                                key={todo.id}
                                                className="glass-card"
                                                style={{
                                                    padding: '0.85rem 1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '0.85rem',
                                                    borderRadius: 'var(--radius-xl)',
                                                    borderLeft: todo.completed ? '4px solid var(--green)' : todo.priority === 'high' ? '4px solid var(--rose)' : '4px solid var(--accent)',
                                                    background: todo.completed ? 'rgba(255, 255, 255, 0.6)' : '#ffffff',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {/* Left Check Circle + Content */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                                    <button
                                                        onClick={() => {
                                                            toggleTodoComplete(todo.id);
                                                            showToast(todo.completed ? 'Task reopened' : 'Task completed!', 'success');
                                                        }}
                                                        style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            border: todo.completed ? 'none' : '2px solid var(--accent)',
                                                            background: todo.completed ? 'var(--green)' : 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            flexShrink: 0,
                                                            color: '#ffffff',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {todo.completed && <Check size={14} strokeWidth={3} />}
                                                    </button>

                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{
                                                            fontSize: '0.9rem',
                                                            fontWeight: 700,
                                                            color: todo.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                                            textDecoration: todo.completed ? 'line-through' : 'none',
                                                            fontFamily: 'Manrope, sans-serif',
                                                            lineHeight: 1.35
                                                        }}>
                                                            {todo.title}
                                                        </p>

                                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.3rem' }}>
                                                            {linkedContact && (
                                                                <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                                                                    👤 {linkedContact.name}
                                                                </span>
                                                            )}

                                                            {todo.due_date && (
                                                                <span style={{
                                                                    fontSize: '0.675rem',
                                                                    color: 'var(--text-secondary)',
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.2rem'
                                                                }}>
                                                                    <Calendar size={11} />
                                                                    {new Date(todo.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}

                                                            {todo.priority && (
                                                                <span style={{
                                                                    fontSize: '0.625rem',
                                                                    fontWeight: 700,
                                                                    textTransform: 'uppercase',
                                                                    color: todo.priority === 'high' ? 'var(--rose)' : todo.priority === 'medium' ? 'var(--amber)' : 'var(--accent)'
                                                                }}>
                                                                    • {todo.priority}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                                    <button
                                                        className="btn-icon"
                                                        style={{ width: 32, height: 32 }}
                                                        onClick={() => openTodoModal(todo)}
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        style={{ width: 32, height: 32, color: 'var(--rose)' }}
                                                        onClick={() => {
                                                            deleteTodo(todo.id);
                                                            showToast('Task deleted', 'info');
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}

                    {/* COMPLETED TASKS ACCORDION */}
                    {grouped.Completed.length > 0 && statusFilter !== 'today' && statusFilter !== 'overdue' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.4rem 0.25rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    fontFamily: 'Manrope, sans-serif'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <CheckCircle2 size={15} color="var(--green)" />
                                    <span>Completed Tasks ({grouped.Completed.length})</span>
                                </div>
                                {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {showCompleted && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                    {grouped.Completed.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="glass-card"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '0.75rem',
                                                borderRadius: 'var(--radius-xl)',
                                                borderLeft: '4px solid var(--green)',
                                                opacity: 0.7
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                                <button
                                                    onClick={() => toggleTodoComplete(todo.id)}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: '50%',
                                                        background: 'var(--green)',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#ffffff',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Check size={13} strokeWidth={3} />
                                                </button>
                                                <span style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>
                                                    {todo.title}
                                                </span>
                                            </div>
                                            <button
                                                className="btn-icon"
                                                style={{ width: 30, height: 30, color: 'var(--rose)' }}
                                                onClick={() => deleteTodo(todo.id)}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
