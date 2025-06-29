const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for coverUrl
playlistSchema.virtual('coverUrl').get(function() {
  // If playlist has songs, use first song's cover as playlist cover
  if (this.songs && this.songs.length > 0 && this.songs[0].coverUrl) {
    return this.songs[0].coverUrl;
  }
  // Default cover if no songs
  return 'https://res.cloudinary.com/dl2lnn4dc/image/upload/v1750004007/mysic/defaults/playlist_cover.jpg';
});

// Virtual for totalDuration
playlistSchema.virtual('totalDuration').get(function() {
  if (!this.songs || this.songs.length === 0) return '0:00';
  
  const totalSeconds = this.songs.reduce((total, song) => {
    if (song.duration) {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return total + (minutes * 60 + seconds);
    }
    return total;
  }, 0);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Ensure virtuals are included when converting to JSON
playlistSchema.set('toJSON', { virtuals: true });
playlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Playlist', playlistSchema); 