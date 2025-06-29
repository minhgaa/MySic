import { CiMicrophoneOn, CiSaveDown1 } from "react-icons/ci";
import { RiPlayListAddLine } from "react-icons/ri";
import { FaMusic } from "react-icons/fa";
import { IoPlayOutline, IoPauseOutline, IoFlag, IoMusicalNotesOutline } from "react-icons/io5";
import { useMusic } from '../contexts/MusicContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReportDialog from '../components/ReportDialog';
import AddToPlaylist from "../components/AddToPlaylist";
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

// NoMusicPlaying component
const NoMusicPlaying = () => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-gray-400 h-full"
    >
        <motion.div
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
            }}
            transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
            }}
            className="mb-4"
        >
            <IoMusicalNotesOutline size={48} />
        </motion.div>
        <p className="text-sm">No music playing</p>
        <p className="text-xs mt-2">Select a song to start listening</p>
    </motion.div>
);

export default function MusicPlayerPage() {
    const { currentSong, isPlaying, playSong, audioRef, playlist, currentPlaylist, setCurrentPlaylist, setPlaylist } = useMusic();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState({});
    const [progress, setProgress] = useState(0);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [songToReport, setSongToReport] = useState(null);
    const [isAddtoPlaylistDialogOpen, setIsAddtoPlaylistDialogOpen] = useState(false);
    const [songToPlaylist, setSongToPlaylist] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({
        message: '',
        type: 'success'
    });

    // Debug currentPlaylist
    useEffect(() => {
        console.log('Current Playlist:', {
            currentPlaylist,
            playlist,
            currentSong
        });
    }, [currentPlaylist, playlist, currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [audioRef]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch first playlist
                const playlistResponse = await axios.get('http://localhost:8080/api/playlists', {
                    withCredentials: true
                });

                if (playlistResponse.data && playlistResponse.data.length > 0) {
                    const firstPlaylist = playlistResponse.data[0];
                    const playlistDetailResponse = await axios.get(`http://localhost:8080/api/playlists/${firstPlaylist.id}`, {
                        withCredentials: true
                    });
                    
                    if (playlistDetailResponse.data) {
                        setCurrentPlaylist(playlistDetailResponse.data);
                        setPlaylist(playlistDetailResponse.data.songs || []);
                        setLoading(false);
                        return;
                    }
                }

                // If no playlist or error fetching playlist, fetch all songs
                const [songsResponse, genresResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/songs', {
                        withCredentials: true
                    }),
                    axios.get('http://localhost:8080/api/genres', {
                        withCredentials: true
                    })
                ]);

                setSongs(songsResponse.data);

                // Create a map of genre IDs to genre names
                const genreMap = {};
                genresResponse.data.forEach(genre => {
                    genreMap[genre.id] = genre.name;
                });
                setGenres(genreMap);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Debug current state
    useEffect(() => {
        console.log('Current State:', {
            currentSong: currentSong ? {
                id: currentSong.id || currentSong._id,
                title: currentSong.title
            } : null,
            isPlaying,
            totalSongs: songs.length,
            currentPlaylist: currentPlaylist ? {
                id: currentPlaylist.id,
                name: currentPlaylist.name
            } : null,
            playlistLength: playlist.length
        });
    }, [currentSong, isPlaying, songs, currentPlaylist, playlist]);

    // Function to get genre name from genre ID
    const getGenreName = (genreId) => {
        return genres[genreId] || "Unknown Genre";
    };

    const handlePlaylistClick = (song) => {
        setSongToPlaylist(song);
        setIsAddtoPlaylistDialogOpen(true);
    }
    const handlePlayClick = (song) => {
        console.log('Attempting to play song:', song);
        playSong(song);
    };

    const handleReport = (song) => {
        setSongToReport(song);
        setIsReportDialogOpen(true);
    };

    const showNotification = (message, type = 'success') => {
        setToastConfig({ message, type });
        setShowToast(true);
    };

    const handleDownload = async (song) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/songs/${song.id}/download`, {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${song.title}.mp3`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification('Download started successfully');
        } catch (error) {
            console.error('Error downloading song:', error);
            showNotification('Failed to download song', 'error');
        }
    };

    if (loading) {
        return <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>;
    }

    return (
        <div className="w-full h-full bg-slate-950 rounded-lg">
            <AnimatePresence>
                {showToast && (
                    <Toast
                        message={toastConfig.message}
                        type={toastConfig.type}
                        onClose={() => setShowToast(false)}
                        duration={3000}
                    />
                )}
            </AnimatePresence>
            <div className="relative w-full h-[400px]">
                {currentSong ? (
                    <>
                        <img
                            src={currentSong?.songImage || "/src/assets/default-cover.jpg"}
                            className="absolute w-full h-full object-cover rounded-t-lg"
                            alt="Album"
                        />
                        <div className="relative z-10 flex flex-col py-5 px-5 bg-black/40 h-full justify-end items-start rounded-lg">
                            <div className="text-xl font-bold text-white text-center">
                                {currentSong.title}
                            </div>
                            <span className="font-medium text-sm text-gray-300 text-center mt-1">
                                {currentSong.artist}
                            </span>
                            <div className="flex justify-center gap-5 mt-4 text-white">
                                <CiMicrophoneOn size={20} className="cursor-pointer hover:text-orange-500 transition-colors" />
                                <RiPlayListAddLine onClick={() => handlePlaylistClick(currentSong)} size={20} className="cursor-pointer hover:text-orange-500 transition-colors" />
                                <CiSaveDown1 
                                    size={20} 
                                    className="cursor-pointer hover:text-orange-500 transition-colors"
                                    onClick={() => handleDownload(currentSong)}
                                />
                                <IoFlag 
                                    size={20} 
                                    className="cursor-pointer hover:text-red-500 transition-colors"
                                    onClick={() => handleReport(currentSong)}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-lg">
                        <NoMusicPlaying />
                    </div>
                )}
            </div>
            <div className="pb-5 rounded-2xl relative z-20">
                <div className="w-full bg-[#191B20] rounded-2xl pt-5 pb-5 shadow-xl">
                    <div className="flex flex-col w-full h-full items-start px-5">
                        <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-white text-sm font-semibold">
                                {currentPlaylist ? `Playlist: ${currentPlaylist.name}` : 'All songs'}
                            </span>
                            {currentPlaylist && (
                                <span className="text-gray-400 text-xs">
                                    {playlist.length} songs
                                </span>
                            )}
                        </div>
                        <div className="w-full p-2 space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide">
                            <style>
                                {`
                                    .scrollbar-hide::-webkit-scrollbar {
                                        display: none;
                                    }
                                    .scrollbar-hide {
                                        -ms-overflow-style: none;
                                        scrollbar-width: none;
                                    }
                                `}
                            </style>
                            {currentPlaylist ? (
                                playlist.length > 0 ? (
                                    playlist.map((song) => {
                                        const isCurrentSong = currentSong?.id === song.id || currentSong?._id === song.id;
                                        const isCurrentlyPlaying = isCurrentSong && isPlaying;
                                        
                                        return (
                                            <div 
                                                key={song.id} 
                                                className="relative group transition duration-300"
                                            >
                                                <div
                                                    className={`p-2 rounded-xl transition-all duration-300 shadow-md border 
                                                        ${isCurrentlyPlaying
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent"
                                                            : "bg-[#1C1C24] text-gray-300 border-transparent hover:border-orange-500/20 hover:bg-[#2A2A35] hover:shadow-lg"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handlePlayClick(song)}>
                                                            <div className="relative group/image w-8 h-8">
                                                                <img
                                                                    src={song.songImage}
                                                                    alt={song.title}
                                                                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                                                                />
                                                                <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity
                                                                    ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover/image:opacity-100'}`}>
                                                                    {isCurrentlyPlaying ? (
                                                                        <IoPauseOutline className="text-white" size={16} />
                                                                    ) : (
                                                                        <IoPlayOutline className="text-white" size={16} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col max-w-[120px]">
                                                                <span className={`font-semibold text-[10px] truncate ${
                                                                    isCurrentSong ? 'text-white' : 'text-gray-300'
                                                                }`}>
                                                                    {song.title}
                                                                </span>
                                                                <span className={`text-[8px] truncate ${
                                                                    isCurrentSong 
                                                                    ? 'text-white/80' 
                                                                    : 'text-gray-400 group-hover:text-gray-300'
                                                                }`}>
                                                                    {song.artist} • {getGenreName(song.genreId)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`text-[11px] ${
                                                                isCurrentSong 
                                                                ? 'text-white/80' 
                                                                : 'text-gray-400 group-hover:text-gray-300'
                                                            }`}>
                                                                {isCurrentSong ? formatTime(progress) : "00:00"}
                                                            </div>
                                                            <button
                                                                className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                                                                    isCurrentSong 
                                                                    ? 'hover:bg-white/20 text-white' 
                                                                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                                }`}
                                                                onClick={() => handleReport(song)}
                                                            >
                                                                <IoFlag size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-gray-400 py-4">
                                        No songs in this playlist
                                    </div>
                                )
                            ) : (
                                songs.map((song) => {
                                    const isCurrentSong = currentSong?.id === song.id || currentSong?._id === song.id;
                                    const isCurrentlyPlaying = isCurrentSong && isPlaying;
                                    
                                    return (
                                        <div 
                                            key={song.id} 
                                            className="relative group transition duration-300"
                                        >
                                            <div
                                                className={`p-2 rounded-xl transition-all duration-300 shadow-md border 
                                                    ${isCurrentlyPlaying
                                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent"
                                                        : "bg-[#1C1C24] text-gray-300 border-transparent hover:border-orange-500/20 hover:bg-[#2A2A35] hover:shadow-lg"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handlePlayClick(song)}>
                                                        <div className="relative group/image w-8 h-8">
                                                            <img
                                                                src={song.songImage}
                                                                alt={song.title}
                                                                className="w-8 h-8 rounded-full object-cover shadow-sm"
                                                            />
                                                            <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity
                                                                ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover/image:opacity-100'}`}>
                                                                {isCurrentlyPlaying ? (
                                                                    <IoPauseOutline className="text-white" size={16} />
                                                                ) : (
                                                                    <IoPlayOutline className="text-white" size={16} />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col max-w-[120px]">
                                                            <span className={`font-semibold text-[10px] truncate ${
                                                                isCurrentSong ? 'text-white' : 'text-gray-300'
                                                            }`}>
                                                                {song.title}
                                                            </span>
                                                            <span className={`text-[8px] truncate ${
                                                                isCurrentSong 
                                                                ? 'text-white/80' 
                                                                : 'text-gray-400 group-hover:text-gray-300'
                                                            }`}>
                                                                {song.artist} • {getGenreName(song.genreId)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-[11px] ${
                                                            isCurrentSong 
                                                            ? 'text-white/80' 
                                                            : 'text-gray-400 group-hover:text-gray-300'
                                                        }`}>
                                                            {isCurrentSong ? formatTime(progress) : "00:00"}
                                                        </div>
                                                        <button
                                                            className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                                                                isCurrentSong 
                                                                ? 'hover:bg-white/20 text-white' 
                                                                : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                            }`}
                                                            onClick={() => handleReport(song)}
                                                        >
                                                            <IoFlag size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-[300px] bg-[#191B20] rounded-2xl w-full">
                {currentSong ? (
                    <>
                        <div className="relative h-[180px]">
                            <img
                                className="w-full h-full rounded-t-2xl absolute object-cover object-top opacity-70"
                                src={currentSong.songImage || "/src/assets/default-cover.jpg"}
                                alt="Artist"
                            />
                            <span className="relative text-white text-sm font-semibold p-5 block drop-shadow-lg">
                                About the Artist
                            </span>
                        </div>
                        <div className="h-[120px] p-5 flex flex-col justify-center text-white">
                            <div className="flex justify-between">
                                <h3 className="text-base font-bold">{currentSong.artist}</h3>
                                <button className="bg-orange-600 rounded-full text-[10px] p-1 px-2 text-white hover:bg-orange-700 transition-colors">
                                    Follow
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-300 mt-2">
                                {currentSong.artist} is a talented artist known for their unique style and captivating performances.
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Genre: {currentSong ? getGenreName(currentSong.genreId) : "---"}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <NoMusicPlaying />
                    </div>
                )}
            </div>
            <AddToPlaylist
                isOpen={isAddtoPlaylistDialogOpen}
                onClose={() => {
                    setIsAddtoPlaylistDialogOpen(false);
                    setSongToPlaylist(null);
                }}
                contentType="song"
                contentTitle={songToPlaylist?.title || ''}
                song={songToPlaylist}
            />
            <ReportDialog
                isOpen={isReportDialogOpen}
                onClose={() => {
                    setIsReportDialogOpen(false);
                    setSongToReport(null);
                }}
                contentType="song"
                contentTitle={songToReport?.title || ''}
                song={songToReport}
            />
        </div>
    );
}