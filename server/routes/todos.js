const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// GET all todos
router.get('/', async (req, res) => {
    try {
        const todos = await db.getTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST create todo
router.post('/', async (req, res) => {
    try {
        const { title, description, completed, priority, due_date, contact_id } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Todo title is required' });
        }
        const newTodo = await db.createTodo({
            title,
            description,
            completed,
            priority,
            due_date,
            contact_id
        });
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT update todo
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.updateTodo(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Todo not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteTodo(req.params.id);
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
