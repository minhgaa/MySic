const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const Song = require('../models/song');

// Get songs by status (pending, approved, rejected)
router.get('/songs/:status', isAdmin, async (req, res) => {
  try {
    const { status } = req.params;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const songs = await Song.find({ status })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(songs);
  } catch (error) {
    console.error(`Error fetching ${req.params.status} songs:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve a song
router.post('/songs/:id/approve', isAdmin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.status = 'approved';
    await song.save();
    
    res.json({ message: 'Song approved successfully' });
  } catch (error) {
    console.error('Error approving song:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject a song
router.post('/songs/:id/reject', isAdmin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.status = 'rejected';
    await song.save();
    
    res.json({ message: 'Song rejected successfully' });
  } catch (error) {
    console.error('Error rejecting song:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 