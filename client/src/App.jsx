import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ContactModal from './components/ContactModal';
import KeyPointModal from './components/KeyPointModal';
import TodoModal from './components/TodoModal';
import QuickActionSheet from './components/QuickActionSheet';
import OnboardingModal from './components/OnboardingModal';

import Dashboard from './pages/Dashboard';
import ContactsPage from './pages/ContactsPage';
import TodosPage from './pages/TodosPage';
import KeyPointsPage from './pages/KeyPointsPage';
import VoiceNotesPage from './pages/VoiceNotesPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import MeetingAssistant from './pages/MeetingAssistant';

import { useContactStore } from './store/useContactStore';
import { useKeyPointStore } from './store/useKeyPointStore';
import { useTodoStore } from './store/useTodoStore';
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';
import AuthPage from './pages/AuthPage';

export default function App() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const fetchContacts = useContactStore((s) => s.fetchContacts);
    const fetchKeyPoints = useKeyPointStore((s) => s.fetchKeyPoints);
    const fetchTodos = useTodoStore((s) => s.fetchTodos);
    const { activeTab } = useUIStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchContacts();
            fetchKeyPoints();
            fetchTodos();
        }
    }, [isAuthenticated, fetchContacts, fetchKeyPoints, fetchTodos]);

    if (!isAuthenticated) {
        return (
            <>
                <AuthPage />
                <Toast />
            </>
        );
    }

    const renderPage = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'todos': return <TodosPage searchTerm={searchTerm} />;
            case 'voice-notes': return <VoiceNotesPage />;
            case 'profile': return <ProfileSettingsPage />;
            case 'contacts': return <ContactsPage searchTerm={searchTerm} />;
            case 'key-points': return <KeyPointsPage searchTerm={searchTerm} />;
            case 'meeting': return <MeetingAssistant />;
            default: return <Dashboard />;
        }
    };

    return (
        <>
            <div className="app-container">
                <Sidebar />
                <div className="main-content">
                    <Navbar />
                    <main>{renderPage()}</main>
                </div>
            </div>
            <MobileNav />
            <QuickActionSheet />
            <ContactModal />
            <KeyPointModal />
            <TodoModal />
            <OnboardingModal />
            <Toast />
        </>
    );
}
