import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { useContactStore } from '../store/useContactStore';
import { X } from 'lucide-react';

export default function KeyPointModal() {
    const { isKeyPointModalOpen, closeKeyPointModal, keyPointToEdit, keyPointDefaultContactId, showToast } = useUIStore();
    const { addKeyPoint, updateKeyPoint } = useKeyPointStore();
    const contacts = useContactStore((s) => s.contacts);

    const [contactId, setContactId] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        if (keyPointToEdit) {
            setContactId(keyPointToEdit.contact_id || '');
            setText(keyPointToEdit.text || '');
        } else {
            setContactId(keyPointDefaultContactId || (contacts.length > 0 ? contacts[0].id : ''));
            setText('');
        }
    }, [keyPointToEdit, keyPointDefaultContactId, isKeyPointModalOpen, contacts]);

    if (!isKeyPointModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contactId) { showToast('Select a contact', 'error'); return; }
        if (!text.trim()) return;
        try {
            if (keyPointToEdit) { await updateKeyPoint(keyPointToEdit.id, { contact_id: contactId, text }); showToast('Updated!', 'success'); }
            else { await addKeyPoint({ contact_id: contactId, text, covered: false }); showToast('Point added!', 'success'); }
            closeKeyPointModal();
        } catch (err) { showToast('Failed to save', 'error'); }
    };

    return (
        <div className="modal-overlay" onClick={closeKeyPointModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                    <h3 className="modal-title">{keyPointToEdit ? 'Edit Point' : 'New Key Point'}</h3>
                    <button className="btn-icon" onClick={closeKeyPointModal}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Contact *</label>
                        <select required className="form-select" value={contactId}
                            onChange={(e) => setContactId(e.target.value)}>
                            <option value="" disabled>Select contact</option>
                            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Point to Mention *</label>
                        <textarea required className="form-textarea" placeholder="e.g. Ask about the project deadline..."
                            value={text} onChange={(e) => setText(e.target.value)} rows={3} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeKeyPointModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {keyPointToEdit ? 'Save' : 'Add Point'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
