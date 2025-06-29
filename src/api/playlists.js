const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const { isAuthenticated } = require('../middleware/auth');

// Get all playlists for current user with details
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.id })
      .populate({
        path: 'songs',
        populate: {
          path: 'artist',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // Transform data to include required fields
    const transformedPlaylists = playlists.map(playlist => ({
      id: playlist._id,
      name: playlist.name,
      coverUrl: playlist.coverUrl,
      songs: playlist.songs.map(song => ({
        id: song._id,
        title: song.title,
        artist: song.artist.name,
        coverUrl: song.coverUrl,
        duration: song.duration,
        liked: song.liked
      })),
      totalDuration: playlist.totalDuration,
      createdAt: playlist.createdAt
    }));

    res.json(transformedPlaylists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new playlist
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = new Playlist({
      name,
      userId: req.user.id,
      songs: []
    });

    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add song to playlist
router.post('/:id/songs', isAuthenticated, async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }

    const playlist = await Playlist.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if song already exists in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );
    
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete playlist
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 