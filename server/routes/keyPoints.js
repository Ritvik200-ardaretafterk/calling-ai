const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// GET key points (optionally filtered by contactId query param or param)
router.get('/', async (req, res) => {
    try {
        const contactId = req.query.contactId || null;
        const keyPoints = await db.getKeyPoints(contactId);
        res.json(keyPoints);
    } catch (error) {
        console.error('Error fetching key points:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET key points by contact ID
router.get('/contact/:contactId', async (req, res) => {
    try {
        const keyPoints = await db.getKeyPoints(req.params.contactId);
        res.json(keyPoints);
    } catch (error) {
        console.error('Error fetching key points for contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST create key point
router.post('/', async (req, res) => {
    try {
        const { contact_id, text, covered } = req.body;
        if (!contact_id) {
            return res.status(400).json({ error: 'contact_id is required' });
        }
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Key point text is required' });
        }
        const newKeyPoint = await db.createKeyPoint({ contact_id, text, covered });
        res.status(201).json(newKeyPoint);
    } catch (error) {
        console.error('Error creating key point:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update key point
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.updateKeyPoint(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Key point not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating key point:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE key point
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteKeyPoint(req.params.id);
        res.json({ message: 'Key point deleted successfully' });
    } catch (error) {
        console.error('Error deleting key point:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
