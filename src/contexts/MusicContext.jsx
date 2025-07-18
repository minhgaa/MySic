import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';

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
        audioRef.current.src = song.fileUrl;
        audioRef.current.load();
        
        // Update currentSong immediately with all properties
        setCurrentSong({...song}); // Spread operator to create a new object with all properties
        
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