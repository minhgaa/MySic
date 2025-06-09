import { useState, useEffect } from "react";
import { Box, Slider, Typography, IconButton, Avatar, Dialog, DialogContent, DialogTitle, CircularProgress, Button, TextField } from "@mui/material";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { IoPlayOutline, IoPauseOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline, IoCloseOutline, IoAddOutline, IoImageOutline } from "react-icons/io5";
import { BiVolumeFull, BiListPlus } from "react-icons/bi";
import { PiShuffle, PiRepeat } from "react-icons/pi";
import { useMusic } from '../contexts/MusicContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlaybar = () => {
    const { currentSong, isPlaying, playSong, pauseSong, audioRef, toggleLike, isLiked, likedSongs } = useMusic();
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [songs, setSongs] = useState([]);
    const [isTextOverflow, setIsTextOverflow] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [newPlaylistData, setNewPlaylistData] = useState({
        name: '',
        description: '',
        coverImage: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/songs', {
                    withCredentials: true
                });
                setSongs(response.data);
            } catch (err) {
                console.error('Error fetching songs:', err);
            }
        };

        fetchSongs();
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            handleNextSong();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioRef]);

    // Check if text is overflowing
    useEffect(() => {
        const titleElement = document.getElementById('song-title');
        if (titleElement) {
            setIsTextOverflow(titleElement.scrollWidth > titleElement.clientWidth);
        }
    }, [currentSong]);

    const handleNextSong = () => {
        if (!currentSong || songs.length === 0) return;
        
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        if (currentIndex === -1) return;
        
        const nextIndex = (currentIndex + 1) % songs.length;
        playSong(songs[nextIndex]);
    };

    const handlePreviousSong = () => {
        if (!currentSong || songs.length === 0) return;
        
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        if (currentIndex === -1) return;
        
        const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        playSong(songs[previousIndex]);
    };

    const handleProgressChange = (_, newValue) => {
        if (!currentSong) return;
        
        const audio = audioRef.current;
        audio.currentTime = newValue;
        setProgress(newValue);
    };

    const handleVolumeChange = (_, newValue) => {
        setVolume(newValue);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleLikeClick = async () => {
        if (!currentSong) return;
        
        setIsLikeAnimating(true);
        const liked = await toggleLike(currentSong.id);
        console.log('Like status:', liked, 'for song:', currentSong.id);
        setTimeout(() => setIsLikeAnimating(false), 500);
    };

    // Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setIsLoadingPlaylists(true);
                const response = await axios.get('http://localhost:3000/api/playlists', {
                    withCredentials: true
                });
                console.log('Fetched playlists:', response.data);
                setPlaylists(response.data);
            } catch (err) {
                console.error('Error fetching playlists:', err);
            } finally {
                setIsLoadingPlaylists(false);
            }
        };

        if (openPlaylistDialog) {
            fetchPlaylists();
        }
    }, [openPlaylistDialog]);

    const handleAddToPlaylist = async (playlistId) => {
        if (!currentSong) return;
        
        try {
            setIsAddingToPlaylist(true);
            await axios.post(`http://localhost:3000/api/playlists/${playlistId}/songs`, {
                songId: currentSong.id
            }, {
                withCredentials: true
            });
            
            setSelectedPlaylist(playlistId);
            setTimeout(() => {
                setSelectedPlaylist(null);
                setOpenPlaylistDialog(false);
            }, 1500);
        } catch (err) {
            console.error('Error adding song to playlist:', err);
        } finally {
            setIsAddingToPlaylist(false);
        }
    };

    const handleCreatePlaylistClick = () => {
        setIsCreatingPlaylist(!isCreatingPlaylist);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPlaylistData(prev => ({ ...prev, coverImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistData.name) return;

        try {
            setIsLoadingPlaylists(true);
            const formData = new FormData();
            formData.append('name', newPlaylistData.name);
            formData.append('description', newPlaylistData.description);
            if (newPlaylistData.coverImage) {
                formData.append('coverImage', newPlaylistData.coverImage);
            }

            await axios.post('http://localhost:3000/api/playlists', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form and refresh playlists
            setNewPlaylistData({ name: '', description: '', coverImage: null });
            setImagePreview(null);
            setIsCreatingPlaylist(false);
            
            // Fetch updated playlists
            const response = await axios.get('http://localhost:3000/api/playlists', {
                withCredentials: true
            });
            setPlaylists(response.data);
        } catch (err) {
            console.error('Error creating playlist:', err);
        } finally {
            setIsLoadingPlaylists(false);
        }
    };

    return (
        <>
            <Box className="bg-[#191B20] w-full h-full flex items-center justify-between px-4 py-2 rounded-lg">
                <Box className="flex items-center space-x-4">
                    <Avatar 
                        src={currentSong?.songImage || "/src/assets/default-cover.jpg"} 
                        sx={{ width: 40, height: 40 }} 
                    />
                    <Box className="overflow-hidden">
                        <div className="relative w-[150px] overflow-hidden">
                            <Typography 
                                id="song-title"
                                sx={{ 
                                    color: "white", 
                                    fontFamily: "Montserrat", 
                                    fontSize: "14px", 
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                    animation: isTextOverflow ? "scrollText 10s linear infinite" : "none",
                                    "&:hover": {
                                        animation: isTextOverflow ? "scrollText 5s linear infinite" : "none"
                                    }
                                }}
                            >
                                {currentSong?.title || "No song playing"}
                            </Typography>
                            <style>
                                {`
                                    @keyframes scrollText {
                                        0% { transform: translateX(0%); }
                                        45% { transform: translateX(-100%); }
                                        50% { transform: translateX(100%); }
                                        95% { transform: translateX(0%); }
                                        100% { transform: translateX(0%); }
                                    }
                                `}
                            </style>
                        </div>
                        <Typography sx={{ color: "gray", fontFamily: "Montserrat", fontSize: "12px" }}>
                            {currentSong?.artist || "---"}
                        </Typography>
                    </Box>
                </Box>

                <Box className="flex items-center space-x-4">
                    <IconButton 
                        sx={{ color: "white" }}
                        onClick={handlePreviousSong}
                        disabled={!currentSong}
                    >
                        <IoPlaySkipBackOutline size={22} />
                    </IconButton>
                    <IconButton
                        onClick={() => currentSong && (isPlaying ? pauseSong() : playSong(currentSong))}
                        sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            width: 45,
                            height: 45,
                            borderRadius: "50%",
                            color: "white",
                            '&.Mui-disabled': {
                                color: 'rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        disabled={!currentSong}
                    >
                        {isPlaying ? <IoPauseOutline size={28} /> : <IoPlayOutline size={28} />}
                    </IconButton>
                    <IconButton 
                        sx={{ color: "white" }}
                        onClick={handleNextSong}
                        disabled={!currentSong}
                    >
                        <IoPlaySkipForwardOutline size={22} />
                    </IconButton>
                </Box>

                <Box className="flex flex-col justify-center items-center h-2/3 w-1/3">
                    <Slider
                        value={progress}
                        onChange={handleProgressChange}
                        min={0}
                        max={duration || 100}
                        sx={{
                            color: "white",
                            height: 2,
                            "& .MuiSlider-thumb": {
                                width: 12,
                                height: 12,
                            },
                        }}
                    />
                    <div className="flex justify-between w-full">
                        <Typography sx={{ color: "gray", fontSize: "10px" }}>{formatTime(progress)}</Typography>
                        <Typography sx={{ color: "gray", fontSize: "10px" }}>{formatTime(duration)}</Typography>
                    </div>
                </Box>

                <Box className="flex items-center space-x-4">
                    <IconButton 
                        onClick={handleLikeClick}
                        disabled={!currentSong}
                        className={`transition-transform duration-300 ${isLikeAnimating ? 'scale-125' : 'scale-100'}`}
                        sx={{ 
                            color: "white",
                            '&:hover': {
                                color: '#f97316'
                            }
                        }}
                    >
                        {currentSong && isLiked(currentSong.id) ? (
                            <AiFillHeart size={20} className="text-orange-500" />
                        ) : (
                            <AiOutlineHeart size={20} />
                        )}
                    </IconButton>
                    <IconButton 
                        onClick={() => setOpenPlaylistDialog(true)}
                        disabled={!currentSong}
                        sx={{ 
                            color: "white",
                            '&:hover': {
                                color: '#f97316'
                            }
                        }}
                    >
                        <BiListPlus size={22} />
                    </IconButton>
                    <IconButton sx={{ color: "white" }}>
                        <PiShuffle size={20} />
                    </IconButton>
                    <IconButton sx={{ color: "white" }}>
                        <PiRepeat size={20} />
                    </IconButton>
                    <Box className="flex items-center" sx={{ width: 100 }}>
                        <IconButton sx={{ color: "white" }}>
                            <BiVolumeFull size={20} />
                        </IconButton>
                        <Slider
                            value={volume}
                            onChange={handleVolumeChange}
                            min={0}
                            max={1}
                            step={0.01}
                            sx={{
                                color: "white",
                                height: 2,
                                "& .MuiSlider-thumb": {
                                    width: 8,
                                    height: 8,
                                },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Add to Playlist Dialog */}
            <Dialog
                open={openPlaylistDialog}
                onClose={() => {
                    setOpenPlaylistDialog(false);
                    setIsCreatingPlaylist(false);
                    setNewPlaylistData({ name: '', description: '', coverImage: null });
                    setImagePreview(null);
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#191B20',
                        borderRadius: '16px',
                        minWidth: '400px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflow: 'hidden' // Important for animation
                    }
                }}
            >
                <DialogTitle sx={{ p: 0 }}>
                    <Box className="flex items-center justify-between p-6 pb-2">
                        <Typography sx={{ 
                            color: 'white', 
                            fontSize: '1.5rem', 
                            fontWeight: 600,
                            fontFamily: 'Montserrat'
                        }}>
                            {isCreatingPlaylist ? 'Create New Playlist' : 'Add to Playlist'}
                        </Typography>
                        <IconButton
                            onClick={() => {
                                setOpenPlaylistDialog(false);
                                setIsCreatingPlaylist(false);
                            }}
                            sx={{ color: 'gray', '&:hover': { color: 'white' } }}
                        >
                            <IoCloseOutline size={24} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    <Box className="p-6 pt-2">
                        {/* Create New Playlist Button/Form */}
                        <motion.div
                            initial={false}
                            animate={{ height: isCreatingPlaylist ? 'auto' : '48px' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden mb-6"
                        >
                            {!isCreatingPlaylist ? (
                                <Button
                                    onClick={handleCreatePlaylistClick}
                                    startIcon={<IoAddOutline size={20} />}
                                    sx={{
                                        width: '100%',
                                        py: 1.5,
                                        backgroundColor: 'rgba(234, 88, 12, 0.2)',
                                        color: '#f97316',
                                        borderRadius: 2,
                                        fontFamily: 'Montserrat',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: 'rgba(234, 88, 12, 0.3)',
                                        }
                                    }}
                                >
                                    Create New Playlist
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {/* Cover Image Upload */}
                                    <div className="relative">
                                        <div 
                                            className={`w-full h-48 rounded-xl border-2 border-dashed 
                                                ${imagePreview ? 'border-transparent' : 'border-gray-600'} 
                                                overflow-hidden cursor-pointer
                                                transition-colors hover:border-orange-500`}
                                            onClick={() => document.getElementById('coverImageInput').click()}
                                        >
                                            {imagePreview ? (
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Playlist Cover" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                    <IoImageOutline size={40} />
                                                    <span className="mt-2 text-sm">Click to upload cover image</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="coverImageInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Name Input */}
                                    <TextField
                                        fullWidth
                                        label="Playlist Name"
                                        value={newPlaylistData.name}
                                        onChange={(e) => setNewPlaylistData(prev => ({ ...prev, name: e.target.value }))}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#f97316',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'gray',
                                                '&.Mui-focused': {
                                                    color: '#f97316',
                                                },
                                            },
                                        }}
                                    />

                                    {/* Description Input */}
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description (Optional)"
                                        value={newPlaylistData.description}
                                        onChange={(e) => setNewPlaylistData(prev => ({ ...prev, description: e.target.value }))}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#f97316',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'gray',
                                                '&.Mui-focused': {
                                                    color: '#f97316',
                                                },
                                            },
                                        }}
                                    />

                                    {/* Create Button */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setIsCreatingPlaylist(false)}
                                            sx={{
                                                flex: 1,
                                                py: 1.5,
                                                color: 'gray',
                                                borderRadius: 2,
                                                fontFamily: 'Montserrat',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreatePlaylist}
                                            disabled={!newPlaylistData.name || isLoadingPlaylists}
                                            sx={{
                                                flex: 2,
                                                py: 1.5,
                                                backgroundColor: 'rgba(234, 88, 12, 0.2)',
                                                color: '#f97316',
                                                borderRadius: 2,
                                                fontFamily: 'Montserrat',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(234, 88, 12, 0.3)',
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: 'rgba(234, 88, 12, 0.1)',
                                                    color: 'rgba(249, 115, 22, 0.5)'
                                                }
                                            }}
                                        >
                                            {isLoadingPlaylists ? (
                                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                'Create Playlist'
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Rest of the content */}
                        <AnimatePresence>
                            {!isCreatingPlaylist && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Current Song Info */}
                                    {currentSong && (
                                        <Box className="flex items-center gap-4 p-4 rounded-lg bg-white/5 mb-6">
                                            <Avatar 
                                                src={currentSong.songImage} 
                                                variant="rounded"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Box>
                                                <Typography sx={{ 
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                    fontFamily: 'Montserrat'
                                                }}>
                                                    {currentSong.title}
                                                </Typography>
                                                <Typography sx={{ 
                                                    color: 'gray',
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'Montserrat'
                                                }}>
                                                    {currentSong.artist}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Playlists Grid */}
                                    {isLoadingPlaylists ? (
                                        <Box className="flex items-center justify-center py-12">
                                            <CircularProgress sx={{ color: '#f97316' }} />
                                        </Box>
                                    ) : playlists.length === 0 ? (
                                        <Box className="text-center py-12">
                                            <Typography sx={{ 
                                                color: 'gray',
                                                fontSize: '0.875rem',
                                                fontFamily: 'Montserrat'
                                            }}>
                                                No playlists found
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {playlists.map((playlist) => (
                                                <Box
                                                    key={playlist.id}
                                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                                    className={`
                                                        relative flex items-center gap-3 p-3 rounded-lg cursor-pointer
                                                        transition-all duration-300 transform hover:scale-[1.02]
                                                        ${selectedPlaylist === playlist.id ? 'bg-orange-500/20' : 'bg-white/5 hover:bg-white/10'}
                                                    `}
                                                >
                                                    <Avatar 
                                                        src={playlist.coverUrl} 
                                                        variant="rounded" 
                                                        sx={{ width: 48, height: 48 }}
                                                    />
                                                    <Box>
                                                        <Typography sx={{ 
                                                            color: 'white',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500,
                                                            fontFamily: 'Montserrat'
                                                        }}>
                                                            {playlist.name}
                                                        </Typography>
                                                        <Typography sx={{ 
                                                            color: 'gray',
                                                            fontSize: '0.75rem',
                                                            fontFamily: 'Montserrat'
                                                        }}>
                                                            {playlist.songCount} songs
                                                        </Typography>
                                                    </Box>

                                                    {/* Success Indicator */}
                                                    {selectedPlaylist === playlist.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-orange-500/20">
                                                            <div className="text-orange-500 font-medium">Added!</div>
                                                        </div>
                                                    )}

                                                    {/* Loading Indicator */}
                                                    {isAddingToPlaylist && selectedPlaylist === playlist.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </DialogContent>
            </Dialog>

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                `}
            </style>
        </>
    );
};

export default MusicPlaybar;
