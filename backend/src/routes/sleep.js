const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/today', (req, res) => {
    res.json({
        success: true,
        date: new Date().toISOString().split('T'),
        sleepHours: 8,
        quality: 8
    });
});

router.post('/', [
    body('sleepDate').notEmpty(),
    body('sleepTime').notEmpty(),
    body('wakeTime').notEmpty(),
    body('sleepQuality').isInt({ min: 1, max: 10 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    res.status(201).json({
        success: true,
        data: { id: '123', ...req.body }
    });
});

module.exports = router;
