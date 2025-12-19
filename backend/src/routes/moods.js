const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/today', (req, res) => {
    res.json({
        success: true,
        date: new Date().toISOString().split('T'),
        data: []
    });
});

router.post('/', [
    body('emotion').notEmpty().isIn(['happy', 'sad', 'anxious', 'angry', 'tired', 'neutral']),
    body('moodLevel').isInt({ min: 1, max: 10 }),
    body('timeOfDay').notEmpty().isIn(['morning', 'noon', 'evening']),
    body('reason').optional().isString()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    res.status(201).json({
        success: true,
        message: 'Mood entry created',
        data: { id: '123', ...req.body, created_at: new Date().toISOString() }
    });
});

router.get('/weekly', (req, res) => {
    res.json({
        success: true,
        avgMood: 7.2,
        totalEntries: 15
    });
});

module.exports = router;
