import { create } from 'zustand';
import { api } from '../services/api';

export const useTodoStore = create((set, get) => ({
    todos: [],
    isLoading: false,
    error: null,
    filter: 'all', // 'all' | 'pending' | 'completed'

    setFilter: (filter) => set({ filter }),

    fetchTodos: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await api.getTodos();
            set({ todos: data, isLoading: false });
        } catch (err) {
            set({ error: err.message || 'Failed to fetch todos', isLoading: false });
        }
    },

    addTodo: async (payload) => {
        try {
            const created = await api.createTodo(payload);
            set((state) => ({ todos: [created, ...state.todos] }));
            return created;
        } catch (err) {
            throw err;
        }
    },

    updateTodo: async (id, updates) => {
        try {
            const updated = await api.updateTodo(id, updates);
            set((state) => ({
                todos: state.todos.map((t) => (t.id === id ? updated : t))
            }));
            return updated;
        } catch (err) {
            throw err;
        }
    },

    toggleTodoComplete: async (id) => {
        const item = get().todos.find((t) => t.id === id);
        if (!item) return;
        try {
            const updated = await api.updateTodo(id, { completed: !item.completed });
            set((state) => ({
                todos: state.todos.map((t) => (t.id === id ? updated : t))
            }));
        } catch (err) {
            throw err;
        }
    },

    deleteTodo: async (id) => {
        try {
            await api.deleteTodo(id);
            set((state) => ({
                todos: state.todos.filter((t) => t.id !== id)
            }));
        } catch (err) {
            throw err;
        }
    }
}));
