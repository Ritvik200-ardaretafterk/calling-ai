import { create } from 'zustand';
import { api } from '../services/api';

export const useKeyPointStore = create((set, get) => ({
    keyPoints: [],
    isLoading: false,
    error: null,

    fetchKeyPoints: async (contactId = null) => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.getKeyPoints(contactId);
            set({ keyPoints: data, isLoading: false });
        } catch (err) {
            set({ error: err.message || 'Failed to fetch key points', isLoading: false });
        }
    },

    addKeyPoint: async (payload) => {
        try {
            const created = await api.createKeyPoint(payload);
            set((state) => ({ keyPoints: [created, ...state.keyPoints] }));
            return created;
        } catch (err) {
            throw err;
        }
    },

    updateKeyPoint: async (id, updates) => {
        try {
            const updated = await api.updateKeyPoint(id, updates);
            set((state) => ({
                keyPoints: state.keyPoints.map((k) => (k.id === id ? updated : k))
            }));
            return updated;
        } catch (err) {
            throw err;
        }
    },

    toggleCovered: async (id) => {
        const item = get().keyPoints.find((k) => k.id === id);
        if (!item) return;
        try {
            const updated = await api.updateKeyPoint(id, { covered: !item.covered });
            set((state) => ({
                keyPoints: state.keyPoints.map((k) => (k.id === id ? updated : k))
            }));
        } catch (err) {
            throw err;
        }
    },

    deleteKeyPoint: async (id) => {
        try {
            await api.deleteKeyPoint(id);
            set((state) => ({
                keyPoints: state.keyPoints.filter((k) => k.id !== id)
            }));
        } catch (err) {
            throw err;
        }
    }
}));
