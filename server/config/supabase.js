const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let isSupabaseConnected = false;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConnected = true;
    console.log('✅ Supabase client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase environment variables not configured. Using local fallback store for seamless testing.');
}

// Database fallback store (starts empty)
const memoryStore = {
  contacts: [],
  key_points: [],
  todos: []
};

// Database Service abstraction supporting Supabase with seamless Memory Fallback
const db = {
  isSupabaseConnected: () => isSupabaseConnected,
  supabaseClient: () => supabase,

  // --- CONTACTS ---
  async getContacts() {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return [...memoryStore.contacts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getContactById(id) {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    return memoryStore.contacts.find(c => c.id === id) || null;
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

    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('contacts').insert([payload]).select().single();
      if (error) throw error;
      return data;
    }

    const newContact = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.contacts.unshift(newContact);
    return newContact;
  },

  async updateContact(id, updates) {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }

    const idx = memoryStore.contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;
    memoryStore.contacts[idx] = {
      ...memoryStore.contacts[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return memoryStore.contacts[idx];
  },

  async deleteContact(id) {
    if (isSupabaseConnected) {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    memoryStore.contacts = memoryStore.contacts.filter(c => c.id !== id);
    memoryStore.key_points = memoryStore.key_points.filter(k => k.contact_id !== id);
    memoryStore.todos = memoryStore.todos.map(t => t.contact_id === id ? { ...t, contact_id: null } : t);
    return true;
  },

  // --- KEY POINTS ---
  async getKeyPoints(contactId = null) {
    if (isSupabaseConnected) {
      let query = supabase.from('key_points').select('*, contacts(name, company)');
      if (contactId) {
        query = query.eq('contact_id', contactId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    let items = [...memoryStore.key_points];
    if (contactId) {
      items = items.filter(k => k.contact_id === contactId);
    }
    return items.map(k => {
      const contact = memoryStore.contacts.find(c => c.id === k.contact_id);
      return {
        ...k,
        contacts: contact ? { name: contact.name, company: contact.company } : null
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createKeyPoint(payload) {
    const item = {
      contact_id: payload.contact_id,
      text: payload.text,
      covered: payload.covered || false
    };

    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('key_points').insert([item]).select('*, contacts(name, company)').single();
      if (error) throw error;
      return data;
    }

    const newKeyPoint = {
      id: crypto.randomUUID(),
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.key_points.unshift(newKeyPoint);
    const contact = memoryStore.contacts.find(c => c.id === newKeyPoint.contact_id);
    return {
      ...newKeyPoint,
      contacts: contact ? { name: contact.name, company: contact.company } : null
    };
  },

  async updateKeyPoint(id, updates) {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('key_points').update(updates).eq('id', id).select('*, contacts(name, company)').single();
      if (error) throw error;
      return data;
    }

    const idx = memoryStore.key_points.findIndex(k => k.id === id);
    if (idx === -1) return null;
    memoryStore.key_points[idx] = {
      ...memoryStore.key_points[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    const updated = memoryStore.key_points[idx];
    const contact = memoryStore.contacts.find(c => c.id === updated.contact_id);
    return {
      ...updated,
      contacts: contact ? { name: contact.name, company: contact.company } : null
    };
  },

  async deleteKeyPoint(id) {
    if (isSupabaseConnected) {
      const { error } = await supabase.from('key_points').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    memoryStore.key_points = memoryStore.key_points.filter(k => k.id !== id);
    return true;
  },

  // --- TODOS ---
  async getTodos() {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('todos').select('*, contacts(name, company)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    return memoryStore.todos.map(t => {
      const contact = t.contact_id ? memoryStore.contacts.find(c => c.id === t.contact_id) : null;
      return {
        ...t,
        contacts: contact ? { name: contact.name, company: contact.company } : null
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createTodo(payload) {
    const item = {
      contact_id: payload.contact_id || null,
      title: payload.title,
      description: payload.description || '',
      completed: payload.completed || false,
      priority: payload.priority || 'medium',
      due_date: payload.due_date || null
    };

    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('todos').insert([item]).select('*, contacts(name, company)').single();
      if (error) throw error;
      return data;
    }

    const newTodo = {
      id: crypto.randomUUID(),
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.todos.unshift(newTodo);
    const contact = newTodo.contact_id ? memoryStore.contacts.find(c => c.id === newTodo.contact_id) : null;
    return {
      ...newTodo,
      contacts: contact ? { name: contact.name, company: contact.company } : null
    };
  },

  async updateTodo(id, updates) {
    if (isSupabaseConnected) {
      const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select('*, contacts(name, company)').single();
      if (error) throw error;
      return data;
    }

    const idx = memoryStore.todos.findIndex(t => t.id === id);
    if (idx === -1) return null;
    memoryStore.todos[idx] = {
      ...memoryStore.todos[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    const updated = memoryStore.todos[idx];
    const contact = updated.contact_id ? memoryStore.contacts.find(c => c.id === updated.contact_id) : null;
    return {
      ...updated,
      contacts: contact ? { name: contact.name, company: contact.company } : null
    };
  },

  async deleteTodo(id) {
    if (isSupabaseConnected) {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    memoryStore.todos = memoryStore.todos.filter(t => t.id !== id);
    return true;
  }
};

module.exports = { db };
