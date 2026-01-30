import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Hls from 'hls.js';

const MusicContext = createContext();

export const useMusic = () => {
    return useContext(MusicContext);
};

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [likedSongs, setLikedSongs] = useState(new Set());
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const audioRef = useRef(new Audio());
    const hlsRef = useRef(null);

    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/users/liked', {
                    withCredentials: true
                });
                const likedSongIds = new Set(response.data.map(song => song._id));
                setLikedSongs(likedSongIds);
            } catch (error) {
                console.error('Error fetching liked songs:', error);
            }
        };

        fetchLikedSongs();
    }, []);

    const cleanupHls = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    };

    const setupAudioSource = (fileUrl) => {
        // Clean up previous HLS instance
        cleanupHls();

        // Check if it's a streaming key (ends with .m3u8 or doesn't start with http)
        const isStreamingKey = fileUrl.endsWith('.m3u8') || !fileUrl.startsWith('http');
        
        if (isStreamingKey) {
            // It's a streaming key, prepend CloudFront URL
            const streamUrl = `https://d58vokudzsdux.cloudfront.net/${fileUrl}`;
            console.log('Loading HLS stream:', streamUrl);

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                
                hls.loadSource(streamUrl);
                hls.attachMedia(audioRef.current);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest loaded successfully');
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error:', data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('Fatal network error, trying to recover');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('Fatal media error, trying to recover');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('Fatal error, cannot recover');
                                hls.destroy();
                                break;
                        }
                    }
                });
                
                hlsRef.current = hls;
            } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari native HLS support
                console.log('Using native HLS support');
                audioRef.current.src = streamUrl;
            } else {
                console.error('HLS is not supported in this browser');
            }
        } else {
            // It's a direct URL, use regular HTML5 audio
            console.log('Loading regular audio file:', fileUrl);
            audioRef.current.src = fileUrl;
        }
        
        audioRef.current.load();
    };

    const playSong = (song, playlistData = null) => {
        console.log('Playing song:', song, 'from playlist:', playlistData);
        
        if (currentSong?.id === song.id) {
            // Same song, just play/pause
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        // New song
        setupAudioSource(song.fileUrl);
        
        // Update currentSong immediately with all properties
        setCurrentSong({...song});
        
        // Update playlist context if playing from playlist
        if (playlistData) {
            setCurrentPlaylist(playlistData.playlist);
            setPlaylist(playlistData.songs);
        } else {
            // Clear playlist context if playing individual song
            setCurrentPlaylist(null);
            setPlaylist([]);
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Audio started playing successfully');
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    // Reset states if playback fails
                    setCurrentSong(null);
                    setIsPlaying(false);
                    setCurrentPlaylist(null);
                    setPlaylist([]);
                });
        }
    };

    const pauseSong = () => {
        console.log('Pausing song');
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const clearPlaylist = () => {
        setCurrentPlaylist(null);
        setPlaylist([]);
    };

    const toggleLike = async (songId) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/songs/${songId}/like`, {}, {
                withCredentials: true
            });
            
            // Update likedSongs based on the response
            if (response.data.like) {
                setLikedSongs(prev => new Set([...prev, songId]));
            } else {
                setLikedSongs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(songId);
                    return newSet;
                });
            }
            
            return response.data.like;
        } catch (error) {
            console.error('Error toggling like:', error);
            return false;
        }
    };

    const isLiked = (songId) => {
        return likedSongs.has(songId);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupHls();
        };
    }, []);

    return (
        <MusicContext.Provider value={{
            currentSong,
            isPlaying,
            playSong,
            pauseSong,
            audioRef,
            toggleLike,
            isLiked,
            likedSongs,
            currentPlaylist,
            playlist,
            clearPlaylist,
            setCurrentPlaylist,
            setPlaylist
        }}>
            {children}
        </MusicContext.Provider>
    );
};