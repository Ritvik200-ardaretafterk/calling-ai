import React, { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { useTodoStore } from '../store/useTodoStore';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { Mic, TrendingUp, Plus, CheckCircle2, Circle, ChevronRight, Users, CheckSquare, Sparkles, Lightbulb } from 'lucide-react';

export default function Dashboard() {
    const { setActiveTab, openTodoModal, openContactModal } = useUIStore();
    const { contacts, fetchContacts } = useContactStore();
    const { todos, fetchTodos, toggleTodoComplete } = useTodoStore();
    const { keyPoints, fetchKeyPoints } = useKeyPointStore();

    const [activeHeroSlide, setActiveHeroSlide] = useState(0);
    const heroCarouselRef = useRef(null);

    useEffect(() => {
        fetchContacts();
        fetchTodos();
        fetchKeyPoints();
    }, [fetchContacts, fetchTodos, fetchKeyPoints]);

    const pendingTodos = todos.filter((t) => !t.completed);
    const coveredKeyPoints = keyPoints.filter((k) => k.covered);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning.';
        if (hour < 18) return 'Good afternoon.';
        return 'Good evening.';
    };

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const handleHeroScroll = () => {
        if (!heroCarouselRef.current) return;
        const width = heroCarouselRef.current.offsetWidth;
        const scrollLeft = heroCarouselRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / width);
        setActiveHeroSlide(newIndex);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
            {/* Header: Collapsed into one clean line */}
            <section id="tour-greeting" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                    {getGreeting()} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>• {formattedDate}</span>
                </h2>
            </section>

            {/* 1. SWIPABLE HORIZONTAL STAT CHIPS ROW */}
            <div id="tour-stat-chips" style={{
                display: 'flex',
                gap: '0.75rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '0.25rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {/* Chip 1: Todos */}
                <div
                    className="glass-card card-interactive"
                    onClick={() => setActiveTab('todos')}
                    style={{
                        flex: '0 0 auto',
                        minWidth: '155px',
                        scrollSnapAlign: 'start',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(0, 107, 92, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckSquare size={18} color="var(--accent)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                            {pendingTodos.length}
                        </p>
                        <p style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {todos.length === 0 ? 'No todos yet' : `${pendingTodos.length} Pending`}
                        </p>
                    </div>
                </div>

                {/* Chip 2: Contacts */}
                <div
                    className="glass-card card-interactive"
                    onClick={() => setActiveTab('contacts')}
                    style={{
                        flex: '0 0 auto',
                        minWidth: '155px',
                        scrollSnapAlign: 'start',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={18} color="var(--on-secondary-container)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                            {contacts.length}
                        </p>
                        <p style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {contacts.length === 0 ? 'No contacts' : 'Contacts'}
                        </p>
                    </div>
                </div>

                {/* Chip 3: Key Points */}
                <div
                    className="glass-card card-interactive"
                    onClick={() => setActiveTab('key-points')}
                    style={{
                        flex: '0 0 auto',
                        minWidth: '155px',
                        scrollSnapAlign: 'start',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TrendingUp size={18} color="var(--amber)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                            {coveredKeyPoints.length}
                        </p>
                        <p style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {keyPoints.length === 0 ? 'No points' : 'Covered'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. SWIPABLE HERO & ASSISTANT CARDS CAROUSEL */}
            <div id="tour-hero-card" style={{ position: 'relative' }}>
                <div
                    ref={heroCarouselRef}
                    onScroll={handleHeroScroll}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        gap: '1rem',
                        scrollbarWidth: 'none',
                        borderRadius: 'var(--radius-xl)'
                    }}
                >
                    {/* Slide 1: Live Assistant Hero Card */}
                    <div
                        className="glass-card"
                        style={{
                            flex: '0 0 100%',
                            scrollSnapAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, rgba(239, 245, 247, 0.95) 0%, rgba(227, 233, 235, 0.95) 100%)',
                            border: '1px solid rgba(0, 107, 92, 0.2)',
                            boxShadow: '0 10px 28px rgba(0, 107, 92, 0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '200px'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(0, 107, 92, 0.1)',
                                    color: 'var(--accent)',
                                    marginBottom: '0.6rem'
                                }}>
                                    <Sparkles size={12} />
                                    <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                        Live Meeting Session
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                    Start a Live Assistant Session
                                </h3>
                                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.45 }}>
                                    Record audio, capture key points, and auto-sync action items to your contacts in real time.
                                </p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setActiveTab('meeting')}
                                style={{
                                    width: 'fit-content',
                                    padding: '0.75rem 1.4rem',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.04em',
                                    boxShadow: '0 4px 14px rgba(0, 107, 92, 0.25)'
                                }}
                            >
                                <Mic size={18} /> GO LIVE NOW
                            </button>
                        </div>
                        <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.06, pointerEvents: 'none' }}>
                            <Mic size={180} color="var(--accent)" />
                        </div>
                    </div>

                    {/* Slide 2: Assistant Tip Card */}
                    <div
                        className="glass-card active-left-border"
                        style={{
                            flex: '0 0 100%',
                            scrollSnapAlign: 'center',
                            padding: '1.5rem',
                            background: '#ffffff',
                            boxShadow: '0 10px 28px rgba(0, 32, 34, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '200px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Lightbulb size={18} color="var(--amber)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                                ASSISTANT TIP & CONTEXT
                            </span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {contacts.length > 0 ? `Ready for session with ${contacts[0].name}` : 'Connect your first contact'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                            {contacts.length > 0
                                ? `You have ${keyPoints.filter(k => k.contact_id === contacts[0].id && !k.covered).length} pending key points for ${contacts[0].name}. Start a live session to transcribe and check them off.`
                                : 'Connect a contact or start recording audio to capture action items and receive live spoken reminders.'}
                        </p>
                        <button
                            className="btn btn-secondary"
                            onClick={() => contacts.length > 0 ? setActiveTab('contacts', contacts[0].id) : openContactModal()}
                            style={{ width: 'fit-content', fontSize: '0.8rem' }}
                        >
                            {contacts.length > 0 ? `View ${contacts[0].name} Details →` : '+ Add First Contact'}
                        </button>
                    </div>
                </div>

                {/* Swipe Pagination Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '0.65rem' }}>
                    <div
                        onClick={() => heroCarouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
                        style={{
                            width: activeHeroSlide === 0 ? 20 : 7,
                            height: 7,
                            borderRadius: 4,
                            background: activeHeroSlide === 0 ? 'var(--accent)' : 'rgba(0, 107, 92, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease'
                        }}
                    />
                    <div
                        onClick={() => heroCarouselRef.current?.scrollTo({ left: heroCarouselRef.current.offsetWidth, behavior: 'smooth' })}
                        style={{
                            width: activeHeroSlide === 1 ? 20 : 7,
                            height: 7,
                            borderRadius: 4,
                            background: activeHeroSlide === 1 ? 'var(--accent)' : 'rgba(0, 107, 92, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease'
                        }}
                    />
                </div>
            </div>

            {/* Bento Grid Sections */}
            <div className="bento-grid" style={{ gap: '1rem' }}>



                {/* Section 2: Today's Todos (Top Pending Items with Tap-to-Complete) */}
                <div id="tour-todays-todos" className="bento-col-12" style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                                Today's Todos
                            </h3>
                        </div>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setActiveTab('todos')}
                            style={{ fontSize: '0.8rem', color: 'var(--accent)', gap: '0.2rem', fontWeight: 600 }}
                        >
                            See All ({todos.length}) <ChevronRight size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {pendingTodos.length > 0 ? (
                            pendingTodos.slice(0, 4).map((todo) => {
                                const contactForTodo = contacts.find((c) => c.id === todo.contact_id);
                                return (
                                    <div
                                        key={todo.id}
                                        className="glass-card"
                                        style={{
                                            padding: '0.85rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.75rem',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                        onClick={() => toggleTodoComplete(todo.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            <button
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: 'var(--text-tertiary)'
                                                }}
                                                title="Mark as completed"
                                            >
                                                <Circle size={18} color="var(--accent)" />
                                            </button>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                                    {todo.title}
                                                </p>
                                                {contactForTodo && (
                                                    <span style={{ fontSize: '0.725rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.15rem', display: 'inline-block' }}>
                                                        👤 {contactForTodo.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`badge ${todo.priority === 'High' || todo.priority === 'high' ? 'badge-rose' : todo.priority === 'Medium' || todo.priority === 'medium' ? 'badge-amber' : 'badge-accent'}`} style={{ fontSize: '0.65rem' }}>
                                            {todo.priority || 'Normal'}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                                <CheckCircle2 size={24} color="var(--accent)" style={{ marginBottom: '0.35rem' }} />
                                {todos.length === 0 ? (
                                    <>
                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>No todos yet — tap + to add one</p>
                                        <p style={{ fontSize: '0.775rem', marginTop: '0.15rem' }}>Create tasks or follow-up action items anytime.</p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>All caught up! Nothing pending.</p>
                                        <p style={{ fontSize: '0.775rem', marginTop: '0.15rem' }}>Great job completing all your action items.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
