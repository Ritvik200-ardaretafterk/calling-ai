import { create } from 'zustand';
import { api } from '../services/api';

export const useContactStore = create((set, get) => ({
    contacts: [],
    isLoading: false,
    error: null,
    selectedContact: null,

    fetchContacts: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.getContacts();
            set({ contacts: data, isLoading: false });
        } catch (err) {
            set({ error: err.message || 'Failed to fetch contacts', isLoading: false });
        }
    },

    setSelectedContact: (contact) => set({ selectedContact: contact }),

    addContact: async (contactData) => {
        try {
            const created = await api.createContact(contactData);
            set((state) => ({ contacts: [created, ...state.contacts] }));
            return created;
        } catch (err) {
            throw err;
        }
    },

    updateContact: async (id, updates) => {
        try {
            const updated = await api.updateContact(id, updates);
            set((state) => ({
                contacts: state.contacts.map((c) => (c.id === id ? updated : c)),
                selectedContact: state.selectedContact?.id === id ? updated : state.selectedContact
            }));
            return updated;
        } catch (err) {
            throw err;
        }
    },

    deleteContact: async (id) => {
        try {
            await api.deleteContact(id);
            set((state) => ({
                contacts: state.contacts.filter((c) => c.id !== id),
                selectedContact: state.selectedContact?.id === id ? null : state.selectedContact
            }));
        } catch (err) {
            throw err;
        }
    }
}));
