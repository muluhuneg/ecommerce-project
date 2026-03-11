const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = ?',
            [req.user.id, false]
        );
        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = ? WHERE id = ? AND user_id = ?',
            [true, req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = ? WHERE user_id = ?',
            [true, req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create notification (internal use, not exposed via API)
async function createNotification(userId, type, title, message, data = null) {
    try {
        await db.query(
            `INSERT INTO notifications (user_id, type, title, message, data) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, type, title, message, data ? JSON.stringify(data) : null]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

module.exports = router;
module.exports.createNotification = createNotification;