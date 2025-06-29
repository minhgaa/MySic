import { useState, useEffect } from "react";
import { Box, Slider, Typography, IconButton, Avatar } from "@mui/material";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { IoPlayOutline, IoPauseOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline } from "react-icons/io5";
import { BiVolumeFull, BiListPlus } from "react-icons/bi";
import { PiShuffle, PiRepeat } from "react-icons/pi";
import { useMusic } from '../contexts/MusicContext';
import axios from 'axios';
import AddToPlaylist from './AddToPlaylist';

const MusicPlaybar = () => {
    const { currentSong, isPlaying, playSong, pauseSong, audioRef, toggleLike, isLiked } = useMusic();
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [songs, setSongs] = useState([]);
    const [isTextOverflow, setIsTextOverflow] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const [openPlaylistDialog, setOpenPlaylistDialog] = useState(false);

    useEffect(() => {
        if (currentSong?.fileUrl) {
            const audio = new Audio(currentSong.fileUrl);
            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });
            audio.addEventListener('error', () => {
                setDuration(0);
            });
        } else {
            setDuration(0);
        }
    }, [currentSong]);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/songs', {
                    withCredentials: true
                });
                setSongs(response.data);
            } catch (err) {
                console.error('Lỗi khi tải danh sách bài hát:', err);
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
        if (audioRef.current) {
            audioRef.current.volume = newValue;
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleLikeClick = async () => {
        if (!currentSong) return;
        
        setIsLikeAnimating(true);
        await toggleLike(currentSong.id);
        setTimeout(() => setIsLikeAnimating(false), 500);
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
                                {currentSong?.title || "Chưa có bài hát nào"}
                            </Typography>
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

            <AddToPlaylist
                isOpen={openPlaylistDialog}
                onClose={() => setOpenPlaylistDialog(false)}
                song={currentSong}
            />

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
        </>
    );
};

export default MusicPlaybar;
