const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// GET all contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await db.getContacts();
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET contact by ID
router.get('/:id', async (req, res) => {
    try {
        const contact = await db.getContactById(req.params.id);
        if (!contact) return res.status(404).json({ error: 'Contact not found' });
        res.json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST create contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, company, notes, avatar_url } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Contact name is required' });
        }
        const newContact = await db.createContact({ name, email, phone, company, notes, avatar_url });
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update contact
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.updateContact(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Contact not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteContact(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
