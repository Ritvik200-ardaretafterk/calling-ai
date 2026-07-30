import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import {
    ChevronRight, ChevronLeft, X
} from 'lucide-react';

const TOUR_STEPS = [
    {
        id: 'greeting',
        targetId: 'tour-greeting',
        badge: 'PART 1 OF 6 • GREETING & STATUS',
        title: '🌅 Daily Greeting & Active Status',
        whatIsIt: 'The top header displaying your daily greeting, date, and assistant status.',
        whyIsItUsed: 'Keeps your work session contextual and confirms whether your voice meeting assistant is active or ready.',
        targetTab: 'dashboard',
        tooltipPosition: 'bottom'
    },
    {
        id: 'stat-chips',
        targetId: 'tour-stat-chips',
        badge: 'PART 2 OF 6 • METRICS',
        title: '📊 Swipable Stat Chips',
        whatIsIt: 'Horizontal scrollable chips showing real-time counts for Pending Tasks, Contacts, and Covered Points.',
        whyIsItUsed: 'Gives you a 1-tap shortcut to jump straight to your task list, contacts directory, or key points tracker.',
        targetTab: 'dashboard',
        tooltipPosition: 'bottom'
    },
    {
        id: 'hero-card',
        targetId: 'tour-hero-card',
        badge: 'PART 3 OF 6 • LIVE ASSISTANT',
        title: '🎙️ Live Session Hero Card',
        whatIsIt: 'The primary voice meeting assistant card with swipable carousel tips and a "GO LIVE NOW" button.',
        whyIsItUsed: 'Tap "GO LIVE NOW" to start real-time audio transcription, auto-track key points, and sync action items during live calls.',
        targetTab: 'dashboard',
        tooltipPosition: 'bottom'
    },
    {
        id: 'quick-fab',
        targetId: 'tour-quick-fab',
        badge: 'PART 4 OF 6 • QUICK ACTION',
        title: '⚡ Central Quick Action Button (+)',
        whatIsIt: 'The floating green (+) button in the center of your bottom navigation bar.',
        whyIsItUsed: 'The fastest entry point into the app — tap to quickly add a New Todo, New Contact, New Key Point, or Start a Voice Session.',
        targetTab: 'dashboard',
        tooltipPosition: 'top'
    },
    {
        id: 'mobile-nav',
        targetId: 'tour-mobile-nav',
        badge: 'PART 5 OF 6 • NAVIGATION',
        title: '🧭 Bottom Navigation Bar',
        whatIsIt: 'The main navigation bar containing Home, Todo, Quick Action (+), Voice Notes, and Profile.',
        whyIsItUsed: 'Effortlessly switch between your dashboard, task manager, live audio sessions, and audio/privacy settings.',
        targetTab: 'dashboard',
        tooltipPosition: 'top'
    },
    {
        id: 'todays-todos',
        targetId: 'tour-todays-todos',
        badge: 'PART 6 OF 6 • ACTION TODOS',
        title: '📋 Today\'s Action Items & Todos',
        whatIsIt: 'Your list of pending tasks and action items captured from meeting sessions.',
        whyIsItUsed: 'Tap any todo to check it off instantly or see linked contacts for quick follow-up.',
        targetTab: 'dashboard',
        tooltipPosition: 'top'
    }
];

export default function OnboardingModal() {
    const { showOnboarding, completeOnboarding } = useAuthStore();
    const { activeTab, setActiveTab } = useUIStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState(null);

    const current = TOUR_STEPS[currentStep];

    // Measure target element position & scroll it into view safely
    useEffect(() => {
        if (!showOnboarding || !current) return;

        if (current.targetTab && activeTab !== current.targetTab) {
            setActiveTab(current.targetTab);
        }

        const updateRect = () => {
            const el = document.getElementById(current.targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
                const bounding = el.getBoundingClientRect();
                setRect({
                    top: bounding.top,
                    left: bounding.left,
                    width: bounding.width,
                    height: bounding.height
                });
            } else {
                setRect(null);
            }
        };

        const timer = setTimeout(updateRect, 100);
        return () => clearTimeout(timer);
    }, [showOnboarding, currentStep, current, activeTab, setActiveTab]);

    useEffect(() => {
        if (!showOnboarding || !current) return;

        const handleResize = () => {
            const el = document.getElementById(current.targetId);
            if (el) {
                const bounding = el.getBoundingClientRect();
                setRect({
                    top: bounding.top,
                    left: bounding.left,
                    width: bounding.width,
                    height: bounding.height
                });
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [showOnboarding, current]);

    if (!showOnboarding || !current) return null;

    const isFirst = currentStep === 0;
    const isLast = currentStep === TOUR_STEPS.length - 1;

    const handleNext = (e) => {
        e?.stopPropagation();
        if (isLast) {
            completeOnboarding();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = (e) => {
        e?.stopPropagation();
        if (!isFirst) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const padding = 8;
    const spotlightStyle = rect ? {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
    } : null;

    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isTopTooltip = current.tooltipPosition === 'top' || (rect && rect.top > windowHeight / 2);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none'
        }}>
            {/* Full-screen Dark Translucent Backdrop for Mobile */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                pointerEvents: 'auto',
                zIndex: 99998
            }} />

            {/* Glowing Spotlight Cutout Box over target UI element */}
            {spotlightStyle && (
                <div style={{
                    position: 'fixed',
                    top: spotlightStyle.top,
                    left: spotlightStyle.left,
                    width: spotlightStyle.width,
                    height: spotlightStyle.height,
                    borderRadius: '16px',
                    border: '3.5px solid #006B5C',
                    boxShadow: '0 0 25px rgba(0, 107, 92, 0.95), inset 0 0 15px rgba(0, 107, 92, 0.5)',
                    background: 'transparent',
                    pointerEvents: 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 99999
                }} />
            )}

            {/* Floating Glassmorphic Tooltip Card with Safe-Area Inset Support */}
            <div style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                ...(isTopTooltip && rect
                    ? { bottom: `calc(env(safe-area-inset-bottom, 16px) + ${Math.max(16, windowHeight - rect.top + 14)}px)` }
                    : { top: rect ? Math.min(windowHeight - 270, rect.top + rect.height + 16) : '25%' }),
                width: 'calc(100% - 28px)',
                maxWidth: '400px',
                zIndex: 100000,
                pointerEvents: 'auto',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Pointer Arrow */}
                {rect && (
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        ...(isTopTooltip
                            ? { bottom: '-9px', borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '9px solid #ffffff' }
                            : { top: '-9px', borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '9px solid #ffffff' }),
                        width: 0,
                        height: 0,
                        zIndex: 3
                    }} />
                )}

                <div
                    style={{
                        borderRadius: '20px',
                        background: '#ffffff',
                        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
                        border: '2.5px solid #006B5C',
                        padding: '1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.625rem', letterSpacing: '0.08em', fontWeight: 800 }}>
                            {current.badge}
                        </span>
                        <button
                            onClick={completeOnboarding}
                            onTouchEnd={completeOnboarding}
                            style={{
                                background: 'rgba(0, 107, 92, 0.08)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                touchAction: 'manipulation'
                            }}
                            title="Skip Tour"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: '#0f172a', lineHeight: 1.25 }}>
                        {current.title}
                    </h3>

                    {/* What is it & Why is it used */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        <div style={{ background: 'rgba(0, 107, 92, 0.06)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 107, 92, 0.12)' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#006B5C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.15rem' }}>
                                🏷️ WHAT IS THIS?
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.4, fontWeight: 500 }}>
                                {current.whatIsIt}
                            </p>
                        </div>

                        <div style={{ background: 'rgba(2, 132, 199, 0.06)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(2, 132, 199, 0.12)' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.15rem' }}>
                                🎯 WHY IS IT USED FOR?
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.4, fontWeight: 500 }}>
                                {current.whyIsItUsed}
                            </p>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        {/* Step Dots */}
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setCurrentStep(i); }}
                                    style={{
                                        width: currentStep === i ? 16 : 6,
                                        height: 6,
                                        borderRadius: 3,
                                        background: currentStep === i ? '#006B5C' : '#cbd5e1',
                                        transition: 'all 0.25s ease',
                                        cursor: 'pointer',
                                        touchAction: 'manipulation'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {!isFirst && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleBack}
                                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.775rem', touchAction: 'manipulation' }}
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, touchAction: 'manipulation' }}
                            >
                                {isLast ? 'GOT IT 🚀' : 'Next Part'} <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
