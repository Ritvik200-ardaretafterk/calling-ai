import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { X } from 'lucide-react';

export default function ContactModal() {
    const { isContactModalOpen, closeContactModal, contactToEdit, showToast } = useUIStore();
    const { addContact, updateContact } = useContactStore();

    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (contactToEdit) {
            setForm({
                name: contactToEdit.name || '', email: contactToEdit.email || '',
                phone: contactToEdit.phone || '', company: contactToEdit.company || '',
                notes: contactToEdit.notes || ''
            });
        } else {
            setForm({ name: '', email: '', phone: '', company: '', notes: '' });
        }
    }, [contactToEdit, isContactModalOpen]);

    if (!isContactModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSubmitting(true);
        try {
            if (contactToEdit) {
                await updateContact(contactToEdit.id, form);
                showToast('Contact updated', 'success');
            } else {
                await addContact(form);
                showToast('Contact added!', 'success');
            }
            closeContactModal();
        } catch (err) {
            showToast('Failed to save', 'error');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="modal-overlay" onClick={closeContactModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                    <h3 className="modal-title">{contactToEdit ? 'Edit Contact' : 'New Contact'}</h3>
                    <button className="btn-icon" onClick={closeContactModal}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input type="text" required className="form-input" placeholder="Full name"
                            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" placeholder="Email address"
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-input" placeholder="Phone number"
                                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Company / Role</label>
                        <input type="text" className="form-input" placeholder="Company or job title"
                            value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-textarea" placeholder="Background, interests, topics to remember..."
                            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeContactModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : contactToEdit ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
