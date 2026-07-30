import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useTodoStore } from '../store/useTodoStore';
import { useContactStore } from '../store/useContactStore';
import { X } from 'lucide-react';

export default function TodoModal() {
    const { isTodoModalOpen, closeTodoModal, todoToEdit, todoDefaultContactId, showToast } = useUIStore();
    const { addTodo, updateTodo } = useTodoStore();
    const contacts = useContactStore((s) => s.contacts);

    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', contact_id: '' });

    useEffect(() => {
        if (todoToEdit) {
            setForm({
                title: todoToEdit.title || '', description: todoToEdit.description || '',
                priority: todoToEdit.priority || 'medium',
                due_date: todoToEdit.due_date ? new Date(todoToEdit.due_date).toISOString().split('T')[0] : '',
                contact_id: todoToEdit.contact_id || ''
            });
        } else {
            setForm({ title: '', description: '', priority: 'medium', due_date: '', contact_id: todoDefaultContactId || '' });
        }
    }, [todoToEdit, todoDefaultContactId, isTodoModalOpen]);

    if (!isTodoModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        try {
            const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null, contact_id: form.contact_id || null };
            if (todoToEdit) { await updateTodo(todoToEdit.id, payload); showToast('Task updated', 'success'); }
            else { await addTodo(payload); showToast('Task added!', 'success'); }
            closeTodoModal();
        } catch (err) { showToast('Failed to save', 'error'); }
    };

    return (
        <div className="modal-overlay" onClick={closeTodoModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                    <h3 className="modal-title">{todoToEdit ? 'Edit Task' : 'New Task'}</h3>
                    <button className="btn-icon" onClick={closeTodoModal}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input type="text" required className="form-input" placeholder="What needs to be done?"
                            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Details</label>
                        <textarea className="form-textarea" placeholder="Optional notes or context..."
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-select" value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input type="date" className="form-input" value={form.due_date}
                                onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Link to Contact</label>
                        <select className="form-select" value={form.contact_id}
                            onChange={(e) => setForm({ ...form, contact_id: e.target.value })}>
                            <option value="">None (General Task)</option>
                            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeTodoModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {todoToEdit ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
