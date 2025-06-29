import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoCheckmarkCircle, IoAlertCircle, IoAdd } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export default function AddToPlaylist({ isOpen, onClose, contentType = 'song', contentTitle = '', song }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tempPlaylistId, setTempPlaylistId] = useState(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/playlists/user/${user.id}`, {
                    withCredentials: true
                });
                setPlaylists(response.data);
            } catch (error) {
                setError('Cannot load playlists');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchPlaylists();
        }
    }, [user?.id]);

    const handleAddToPlaylist = async (playlistId) => {
        try {
            setError(null);
            setIsAdding(true);

            const response = await axios.post(`http://localhost:8080/api/playlists/${playlistId}/songs`, {
                songId: song.id
            }, {
                withCredentials: true
            });

            // Nếu thêm thành công
            setSelectedPlaylist(playlistId);
            
            // Cập nhật lại danh sách playlist
            const updatedPlaylistsResponse = await axios.get(`http://localhost:8080/api/playlists/user/${user.id}`, {
                withCredentials: true
            });
            setPlaylists(updatedPlaylistsResponse.data);

            // Đóng dialog sau 1 giây
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                
                if (status === 409) {
                    setError('Bài hát này đã có trong playlist');
                } else if (status === 400) {
                    setError('Thiếu thông tin playlist hoặc bài hát');
                } else {
                    setError('Không thể thêm bài hát. Vui lòng thử lại sau.');
                }
            } else {
                setError('Lỗi kết nối. Vui lòng kiểm tra lại đường truyền.');
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleCreatePlaylist = () => {
        onClose();
        navigate('/playlist/create');
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const dialogVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                duration: 0.5
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                >
                    <motion.div
                        className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-xl"
                        variants={dialogVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <IoClose size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Add to Playlist</h2>

                            {/* Song Info */}
                            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">
                                    {song?.songImage ? (
                                        <img 
                                            src={song.songImage}
                                            alt={contentTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <IoAlertCircle size={24} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{contentTitle}</h3>
                                    <p className="text-gray-400 text-sm">{song?.artist || 'Unknown Artist'}</p>
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-lg mb-4"
                                >
                                    <IoAlertCircle size={20} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {/* Create New Playlist Button */}
                            <motion.button
                                onClick={handleCreatePlaylist}
                                className="w-full mb-4 p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-white"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <IoAdd size={20} />
                                <span>Create New Playlist</span>
                            </motion.button>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {playlists.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">You have no playlist yet</p>
                                        </div>
                                    ) : (
                                        playlists.map(playlist => (
                                            <motion.button
                                                key={playlist.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAddToPlaylist(playlist.id)}
                                                disabled={isAdding}
                                                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                                                    selectedPlaylist === playlist.id
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-zinc-800 hover:bg-zinc-700'
                                                } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-700">
                                                    {playlist.coverImage ? (
                                                        <img
                                                            src={playlist.coverImage}
                                                            alt={playlist.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <IoAlertCircle size={20} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="font-medium">{playlist.name}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {playlist.songs?.length || 0} songs
                                                        {playlist?.songs?.some(s => s.id === song.id) && (
                                                            <span className="ml-2 text-orange-500">(Already added)</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {selectedPlaylist === playlist.id && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="text-2xl"
                                                    >
                                                        <IoCheckmarkCircle />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <motion.button
                                    onClick={onClose}
                                    className="px-4 py-2 text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isAdding}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 