import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://txawzslneqehwsaxsscv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4YXd6c2xuZXFlaHdzYXhzc2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzOTMyMzUsImV4cCI6MjEwMDk2OTIzNX0.vHRQxSlaC1uFYPvHe0kGLSdA9I-Wzarz4np62G4raAI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const initialLocalContacts = [
    { id: '1', name: 'Sarah Jenkins', role: 'Product Lead', company: 'Acme Corp', email: 'sarah@acme.com', phone: '+1 (555) 019-2834', last_contacted: '2026-07-28' },
    { id: '2', name: 'David Chen', role: 'CTO', company: 'Nexus AI', email: 'david@nexus.ai', phone: '+1 (555) 014-9921', last_contacted: '2026-07-26' },
    { id: '3', name: 'Elena Rostova', role: 'Design Director', company: 'VibeStudio', email: 'elena@vibestudio.io', phone: '+1 (555) 018-4432', last_contacted: '2026-07-25' }
];

const initialLocalKeyPoints = [
    { id: '101', contact_id: '1', text: 'Agreed to review Q3 roadmap proposal by Friday', source: 'Meeting Assistant', created_at: '2026-07-28T14:30:00Z' },
    { id: '102', contact_id: '2', text: 'Budget approved for initial pilot phase ($25k)', source: 'Call Summary', created_at: '2026-07-26T11:15:00Z' }
];

const initialLocalTodos = [
    { id: '201', title: 'Send finalized pilot proposal to David', priority: 'High', due_date: '2026-07-31', completed: false, contact_id: '2', contact_name: 'David Chen' },
    { id: '202', title: 'Schedule Q3 design review with Elena', priority: 'Medium', due_date: '2026-08-02', completed: false, contact_id: '3', contact_name: 'Elena Rostova' }
];

const getLocal = (key, fallback) => {
    try {
        const val = localStorage.getItem(`convopilot_${key}`);
        return val ? JSON.parse(val) : fallback;
    } catch (e) {
        return fallback;
    }
};

const setLocal = (key, val) => {
    try {
        localStorage.setItem(`convopilot_${key}`, JSON.stringify(val));
    } catch (e) { }
};

export const api = {
    // --- CONTACTS ---
    async getContacts() {
        try {
            const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                setLocal('contacts', data);
                return data;
            }
        } catch (e) { }
        return getLocal('contacts', initialLocalContacts);
    },

    async getContact(id) {
        try {
            const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
            if (!error && data) return data;
        } catch (e) { }
        const list = getLocal('contacts', initialLocalContacts);
        return list.find((c) => c.id === id) || list[0];
    },

    async createContact(contactData) {
        const payload = {
            name: contactData.name,
            email: contactData.email || null,
            phone: contactData.phone || null,
            company: contactData.company || null,
            avatar_url: contactData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(contactData.name)}`,
            notes: contactData.notes || '',
        };
        try {
            const { data, error } = await supabase.from('contacts').insert([payload]).select().single();
            if (!error && data) {
                const list = getLocal('contacts', initialLocalContacts);
                setLocal('contacts', [data, ...list]);
                return data;
            }
        } catch (e) { }

        const localObj = { id: String(Date.now()), ...payload, created_at: new Date().toISOString() };
        const list = getLocal('contacts', initialLocalContacts);
        setLocal('contacts', [localObj, ...list]);
        return localObj;
    },

    async updateContact(id, updates) {
        try {
            const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
            if (!error && data) {
                const list = getLocal('contacts', initialLocalContacts);
                const updatedList = list.map((c) => (c.id === id ? data : c));
                setLocal('contacts', updatedList);
                return data;
            }
        } catch (e) { }

        const list = getLocal('contacts', initialLocalContacts);
        const updatedList = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
        setLocal('contacts', updatedList);
        return { id, ...updates };
    },

    async deleteContact(id) {
        try {
            await supabase.from('contacts').delete().eq('id', id);
        } catch (e) { }
        const list = getLocal('contacts', initialLocalContacts);
        setLocal('contacts', list.filter((c) => c.id !== id));
        return { success: true };
    },

    // --- KEY POINTS ---
    async getKeyPoints(contactId = null) {
        try {
            let query = supabase.from('key_points').select('*').order('created_at', { ascending: false });
            if (contactId && contactId !== '') query = query.eq('contact_id', contactId);
            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                setLocal('key_points', data);
                return data;
            }
        } catch (e) { }
        const list = getLocal('key_points', initialLocalKeyPoints);
        return contactId ? list.filter((k) => k.contact_id === contactId) : list;
    },

    async createKeyPoint(payload) {
        const validContactId = (payload.contact_id && payload.contact_id !== '') ? payload.contact_id : null;
        const item = {
            contact_id: validContactId,
            text: payload.text,
            covered: payload.covered || false
        };
        try {
            const { data, error } = await supabase.from('key_points').insert([item]).select().single();
            if (!error && data) {
                const list = getLocal('key_points', initialLocalKeyPoints);
                setLocal('key_points', [data, ...list]);
                return data;
            }
        } catch (e) { }

        const localObj = { id: String(Date.now()), ...item, created_at: new Date().toISOString() };
        const list = getLocal('key_points', initialLocalKeyPoints);
        setLocal('key_points', [localObj, ...list]);
        return localObj;
    },

    async updateKeyPoint(id, updates) {
        try {
            const { data, error } = await supabase.from('key_points').update(updates).eq('id', id).select().single();
            if (!error && data) {
                const list = getLocal('key_points', initialLocalKeyPoints);
                const updatedList = list.map((k) => (k.id === id ? data : k));
                setLocal('key_points', updatedList);
                return data;
            }
        } catch (e) { }

        const list = getLocal('key_points', initialLocalKeyPoints);
        const updatedList = list.map((k) => (k.id === id ? { ...k, ...updates } : k));
        setLocal('key_points', updatedList);
        return { id, ...updates };
    },

    async deleteKeyPoint(id) {
        try {
            await supabase.from('key_points').delete().eq('id', id);
        } catch (e) { }
        const list = getLocal('key_points', initialLocalKeyPoints);
        setLocal('key_points', list.filter((k) => k.id !== id));
        return { success: true };
    },

    // --- TODOS ---
    async getTodos() {
        try {
            const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                setLocal('todos', data);
                return data;
            }
        } catch (e) { }
        return getLocal('todos', initialLocalTodos);
    },

    async createTodo(payload) {
        const validContactId = (payload.contact_id && payload.contact_id !== '') ? payload.contact_id : null;
        const item = {
            contact_id: validContactId,
            title: payload.title,
            description: payload.description || '',
            completed: payload.completed || false,
            priority: payload.priority || 'medium',
            due_date: payload.due_date || null
        };
        try {
            const { data, error } = await supabase.from('todos').insert([item]).select().single();
            if (!error && data) {
                const list = getLocal('todos', initialLocalTodos);
                setLocal('todos', [data, ...list]);
                return data;
            }
        } catch (e) { }

        const localObj = { id: String(Date.now()), ...item, created_at: new Date().toISOString() };
        const list = getLocal('todos', initialLocalTodos);
        setLocal('todos', [localObj, ...list]);
        return localObj;
    },

    async updateTodo(id, updates) {
        try {
            const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select().single();
            if (!error && data) {
                const list = getLocal('todos', initialLocalTodos);
                const updatedList = list.map((t) => (t.id === id ? data : t));
                setLocal('todos', updatedList);
                return data;
            }
        } catch (e) { }

        const list = getLocal('todos', initialLocalTodos);
        const updatedList = list.map((t) => (t.id === id ? { ...t, ...updates } : t));
        setLocal('todos', updatedList);
        return { id, ...updates };
    },

    async deleteTodo(id) {
        try {
            await supabase.from('todos').delete().eq('id', id);
        } catch (e) { }
        const list = getLocal('todos', initialLocalTodos);
        setLocal('todos', list.filter((t) => t.id !== id));
        return { success: true };
    }
};
