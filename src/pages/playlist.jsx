import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoPlayCircle, 
  IoPauseCircle, 
  IoHeartOutline, 
  IoHeart, 
  IoTimeOutline,
  IoMusicalNotesOutline,
  IoEllipsisHorizontal,
  IoTrashOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoAddOutline,
  IoArrowBack,
  IoCloseOutline,
  IoImageOutline
} from 'react-icons/io5';
import BaseView from '../components/BaseView';
import { useAuth } from '../hooks/authContext';
import { useMusic } from '../contexts/MusicContext';

const CreatePlaylistDialog = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ name });
      setName('');
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Playlist</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <IoCloseOutline size={24} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Enter playlist name"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || !name.trim()}
                  className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-orange-500"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Playlist'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PlaylistGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://localhost:8080/api/playlists/user/${user.id}`, {
          withCredentials: true
        });
        
        console.log('Fetched playlists:', response.data); // Debug log
        setPlaylists(response.data);
      } catch (error) {
        console.error('Error loading playlists:', error);
        setError(error.response?.data?.message || 'Could not load playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handlePlaylistClick = (playlist) => {
    if (!playlist.id) {
      console.error('Playlist has no ID:', playlist);
      return;
    }
    navigate(`/playlist/${playlist.id}`);
  };

  const handleCreatePlaylist = async (playlistData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/playlists', playlistData, {
        withCredentials: true
      });

      if (response.data) {
        setPlaylists(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6"
      >
        {playlists && playlists.length > 0 ? (
          <>
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlaylistClick(playlist)}
                className="bg-zinc-900/50 rounded-xl overflow-hidden cursor-pointer group relative flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                    <IoMusicalNotesOutline className="text-white/20" size={64} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white/90 hover:text-white transition-colors"
                      >
                        <IoPlayCircle size={64} />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between bg-zinc-900/80">
                  <h3 className="text-white font-semibold text-lg truncate">{playlist.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <IoMusicalNotesOutline size={16} />
                      <span className="text-sm">{playlist.songs?.length || 0} songs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            No playlists found. Create your first playlist!
          </div>
        )}

        {/* Add New Playlist Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: (playlists?.length || 0) * 0.1,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.05,
            borderColor: "#f97316",
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateDialog(true)}
          className="bg-zinc-900/50 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-zinc-700 aspect-square relative"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <IoAddOutline size={48} className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
            </motion.div>
            <h3 className="text-zinc-700 group-hover:text-orange-500 font-semibold text-sm transition-colors">
              Create New Playlist
            </h3>
          </div>
        </motion.div>
      </motion.div>

      <CreatePlaylistDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreatePlaylist}
      />
    </>
  );
};

const PlaylistDetail = () => {
  const { id } = useParams();
  console.log('PlaylistDetail - Received ID:', id); // Debug log
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, pauseSong } = useMusic();
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSong, setHoveredSong] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSongConfirm, setShowDeleteSongConfirm] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [isDeletingSong, setIsDeletingSong] = useState(false);

  // Hàm chuyển đổi duration từ string sang số giây
  const durationToSeconds = (duration) => {
    if (!duration) return 0;
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  // Hàm chuyển đổi số giây sang string duration
  const secondsToDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Hàm tính tổng duration của playlist
  const calculateTotalDuration = (songs) => {
    if (!songs || songs.length === 0) return '0:00';
    const totalSeconds = songs.reduce((total, song) => {
      return total + durationToSeconds(song.duration);
    }, 0);
    return secondsToDuration(totalSeconds);
  };

  // Hàm lấy duration từ fileUrl
  const getAudioDuration = async (url) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
      audio.src = url;
    });
  };

  // Hàm chuyển đổi số giây sang string duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id && user?.id) {
          const response = await axios.get(`http://localhost:8080/api/playlists/user/${user.id}`, {
            withCredentials: true
          });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const firstPlaylist = response.data[0];
            navigate(`/playlist/${firstPlaylist.id}`, { replace: true });
            return;
          } else {
            setError('No playlists found');
            setLoading(false);
            return;
          }
        }
        
        // Fetch thông tin playlist cụ thể
        if (id) {
          const response = await axios.get(`http://localhost:8080/api/playlists/${id}`, {
            withCredentials: true
          });

          if (response.data) {
            setCurrentPlaylist(response.data);
            // Lấy duration cho từng bài hát
            const songsWithDuration = await Promise.all(
              (response.data.songs || []).map(async (song) => {
                if (song.fileUrl) {
                  const duration = await getAudioDuration(song.fileUrl);
                  return { ...song, duration: formatDuration(duration) };
                }
                return song;
              })
            );
            setSongs(songsWithDuration);
          } else {
            setError('Playlist not found');
          }
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError(error.response?.data?.message || 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPlaylist();
    } else {
      setError('Please login to view playlists');
      setLoading(false);
    }
  }, [id, user?.id, navigate]);

  const handleDeletePlaylist = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await axios.delete(`http://localhost:8080/api/playlists/${id}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        navigate('/playlist');
      } else {
        setError('Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError(error.response?.data?.message || 'Failed to delete playlist');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteSong = async (song) => {
    setSongToDelete(song);
    setShowDeleteSongConfirm(true);
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete || !id) return;
    
    try {
      setIsDeletingSong(true);
      setError(null);
      
      const response = await axios.delete(`http://localhost:8080/api/playlists/${id}/songs/${songToDelete.id}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        // Cập nhật lại danh sách bài hát
        setSongs(prevSongs => prevSongs.filter(s => s.id !== songToDelete.id));
      } else {
        setError('Cannot remove song from playlist');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      setError(error.response?.data?.message || 'Cannot remove song from playlist');
    } finally {
      setIsDeletingSong(false);
      setShowDeleteSongConfirm(false);
      setSongToDelete(null);
    }
  };

  const handlePlayClick = (song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(song, {
          playlist: currentPlaylist,
          songs: songs
        });
      }
    } else {
      playSong(song, {
        playlist: currentPlaylist,
        songs: songs
      });
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      if (currentSong?.id === songs[0].id && isPlaying) {
        pauseSong();
      } else {
        playSong(songs[0], {
          playlist: currentPlaylist,
          songs: songs
        });
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <BaseView>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </BaseView>
    );
  }

  if (error || !currentPlaylist) {
    return (
      <BaseView>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Playlist not found'}</div>
          {error === 'No playlists found' && (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create New Playlist
            </button>
          )}
        </div>
      </BaseView>
    );
  }

  return (
    <BaseView>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-full bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-xl p-6"
      >
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/playlist')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 group"
        >
          <IoArrowBack className="text-2xl transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Playlists</span>
        </motion.button>

        {/* Playlist Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-8 mb-8"
        >
          {/* Playlist Cover with hover effect */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-60 h-60 rounded-lg overflow-hidden shadow-2xl relative group"
          >
            <img 
              src={songs[0]?.songImage || currentPlaylist.coverUrl} 
              alt={currentPlaylist.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayAll}
                className="text-white/90 hover:text-white transition-colors"
              >
                {currentSong?.id === songs[0]?.id && isPlaying ? (
                  <IoPauseCircle size={64} />
                ) : (
                  <IoPlayCircle size={64} />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Playlist Info with staggered animation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-end"
          >
            <motion.h4 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-2"
            >
              Playlist
            </motion.h4>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold text-white mb-4"
            >
              {currentPlaylist.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 mb-6"
            >
              {currentPlaylist.description}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 text-gray-400"
            >
              <div className="flex items-center gap-2">
                <IoMusicalNotesOutline />
                <span>{songs.length} songs</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline />
                <span>{calculateTotalDuration(songs)}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, color: '#ef4444' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto px-4 py-2 text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <IoTrashOutline size={20} />
                <span>Delete Playlist</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Songs List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {/* Header */}
          <div className="grid grid-cols-[16px,1.5fr,1fr,0.5fr,48px] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-gray-700/50">
            <div>#</div>
            <div>Title</div>
            <div>Artist</div>
            <div>Duration</div>
            <div></div>
          </div>

          {/* Songs */}
          {songs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            const isCurrentlyPlaying = isCurrentSong && isPlaying;
            
            return (
              <motion.div
                key={song.id}
                variants={item}
                onMouseEnter={() => setHoveredSong(song.id)}
                onMouseLeave={() => setHoveredSong(null)}
                className={`grid grid-cols-[16px,1.5fr,1fr,0.5fr,48px] gap-4 p-4 rounded-lg ${
                  hoveredSong === song.id ? 'bg-white/5' : ''
                } ${isCurrentSong ? 'bg-white/10' : ''}`}
              >
                <div className="flex items-center text-gray-400">
                  {hoveredSong === song.id ? (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => handlePlayClick(song)}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      {isCurrentlyPlaying ? (
                        <IoPauseOutline size={16} />
                      ) : (
                        <IoPlayOutline size={16} />
                      )}
                    </motion.button>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img 
                      src={song.songImage} 
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-white font-medium ${isCurrentSong ? 'text-orange-500' : ''}`}>
                    {song.title}
                  </span>
                </div>

                <div className="flex items-center text-gray-400">
                  <span>{song.artist}</span>
                </div>

                <div className="flex items-center text-gray-400">
                  <span>{song.duration}</span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={song.liked ? 'text-orange-500' : 'text-gray-400 hover:text-white'}
                  >
                    {song.liked ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
                  </motion.button>
                  
                  {hoveredSong === song.id && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleDeleteSong(song)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <IoTrashOutline size={20} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Delete Song Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteSongConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Xóa bài hát</h3>
              <p className="text-gray-400 mb-6">
                Bạn có chắc chắn muốn xóa "{songToDelete?.title}" khỏi playlist này?
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setShowDeleteSongConfirm(false)}
                  className="px-4 py-2 text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  onClick={confirmDeleteSong}
                  disabled={isDeletingSong}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDeletingSong ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <IoTrashOutline size={18} />
                      Xóa bài hát
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Delete Playlist</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{currentPlaylist.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeletePlaylist}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <IoTrashOutline size={18} />
                      Delete Playlist
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseView>
  );
};

const Playlist = () => {
  const { id } = useParams();

  if (id) {
    return <PlaylistDetail />;
  }

  return (
    <BaseView>
      <div className="min-h-full bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-xl">
        <div className="p-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Your Playlists
          </motion.h1>
          <PlaylistGrid />
        </div>
      </div>
    </BaseView>
  );
};

export default Playlist; 