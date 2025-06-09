const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Song = require('../models/song');
const { isAdmin } = require('../middleware/auth');

// Function to count songs for a user
const countUserSongs = (songs, userId) => {
  return songs.filter(song => song.uploadedBy.toString() === userId.toString()).length;
};

// Get all users (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    // Get all users and songs
    const [users, allSongs] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Song.find().select('uploadedBy')
    ]);

    // Add song count for each user
    const usersWithSongCount = users.map(user => ({
      ...user.toObject(),
      uploadedSongs: countUserSongs(allSongs, user._id)
    }));
    
    res.json(usersWithSongCount);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a user and all their songs (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete all songs uploaded by the user
    await Song.deleteMany({ uploadedBy: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User and all their content deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 