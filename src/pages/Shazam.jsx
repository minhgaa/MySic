import React from 'react'
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiShazam } from 'react-icons/si';
import { IoPlayCircle, IoCloseCircle } from 'react-icons/io5';
import { FaMedal } from 'react-icons/fa';
import axios from 'axios';
import { useMusic } from '../contexts/MusicContext';

const ShazamView = () => {
    const [recordingStatus, setRecordingStatus] = useState('Recording...');
    const [detectedSongs, setDetectedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const { playSong } = useMusic();

    useEffect(() => {
        startRecording();

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendAudioToAPI(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecordingStatus('Detecting a song...');

            setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                    setRecordingStatus('Processing...');
                }
            }, 15000);

        } catch (error) {
            console.error('Microphone error:', error);
            setRecordingStatus('Error: Could not access microphone');
        }
    };

    const sendAudioToAPI = async (audioBlob) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await axios.post('http://localhost:3000/api/audio/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            console.log('API response:', response.data);

            if (response.data.success && response.data.matches?.length > 0) {
                // Fetch full song details for each match
                const songDetails = await Promise.all(
                    response.data.matches.map(async (match) => {
                        try {
                            const songResponse = await axios.get(`http://localhost:8080/api/songs/${match.SongID}`, {
                                withCredentials: true
                            });
                            return {
                                ...songResponse.data,
                                matchScore: match.Score,
                                timestamp: match.Timestamp
                            };
                        } catch (err) {
                            console.error(`Error fetching song ${match.SongID}:`, err);
                            return null;
                        }
                    })
                );

                const validSongs = songDetails.filter(song => song !== null);
                setDetectedSongs(validSongs);
                setRecordingStatus(validSongs.length > 0 ? 'Song detected!' : 'No song detected');
            } else {
                setRecordingStatus('No song detected');
            }
        } catch (error) {
            console.error('API error:', error);
            setRecordingStatus('Error: Could not identify song');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setDetectedSongs([]);
        setRecordingStatus('Recording...');
        startRecording();
    };

    const handlePlaySong = (song) => {
        playSong(song);
    };

    const getMedalColor = (index) => {
        switch(index) {
            case 0: return '#FFD700'; // Gold
            case 1: return '#C0C0C0'; // Silver
            case 2: return '#CD7F32'; // Bronze
            default: return '#gray';
        }
    };

    return (
        <motion.div
            className="text-white flex flex-col justify-center items-center h-full w-full relative overflow-hidden"
        >
            <AnimatePresence mode="wait">
                {detectedSongs.length === 0 ? (
                    <motion.div
                        key="detecting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <span className='absolute top-10 z-10 text-2xl font-bold'>{recordingStatus}</span>

                        <div className="relative flex items-center justify-center">
                            {/* Smooth Ripple Effect */}
                            {[0, 0.6, 1.2].map((delay, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
                                    initial={{
                                        scale: 0.3,
                                        backgroundColor: "rgba(249,115,22,0.8)",
                                    }}
                                    animate={{
                                        scale: 2.4,
                                        backgroundColor: "rgba(249,115,22,0)",
                                    }}
                                    transition={{
                                        duration: 2.4,
                                        repeat: Infinity,
                                        ease: "easeOut",
                                        delay,
                                    }}
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                    }}
                                />
                            ))}

                            {/* Shazam Icon Pulse */}
                            <motion.div
                                className="relative z-10"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            >
                                <SiShazam className='w-32 h-32' />
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="w-full max-w-4xl px-6 py-8"
                    >
                        {/* Header */}
                        <motion.div 
                            className="text-center mb-8"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                Top Matches
                            </h1>
                            <p className="text-gray-400">Found {detectedSongs.length} matching song{detectedSongs.length > 1 ? 's' : ''}</p>
                        </motion.div>

                        {/* Song Cards */}
                        <div className="space-y-4 mb-6">
                            {detectedSongs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-zinc-800/70 transition-all duration-300 group cursor-pointer"
                                    whileHover={{ scale: 1.02, y: -5 }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Medal */}
                                        <div className="flex-shrink-0">
                                            <motion.div
                                                className="relative"
                                                whileHover={{ rotate: 15 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <FaMedal 
                                                    size={40} 
                                                    style={{ color: getMedalColor(index) }}
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-900">
                                                    {index + 1}
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Album Art */}
                                        <motion.div 
                                            className="flex-shrink-0 relative group"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <img 
                                                src={song.songImage || "/default-cover.jpg"} 
                                                alt={song.title}
                                                className="w-20 h-20 rounded-lg object-cover shadow-lg"
                                            />
                                            <motion.div
                                                className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handlePlaySong(song)}
                                            >
                                                <IoPlayCircle size={40} className="text-orange-500" />
                                            </motion.div>
                                        </motion.div>

                                        {/* Song Info */}
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                                                {song.title}
                                            </h3>
                                            <p className="text-gray-400">{song.artist}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
                                                    Match Score: {song.matchScore?.toLocaleString()}
                                                </span>
                                                {song.genre && (
                                                    <span className="text-xs bg-zinc-700 text-gray-300 px-2 py-1 rounded-full">
                                                        {song.genre.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Play Button */}
                                        <motion.button
                                            onClick={() => handlePlaySong(song)}
                                            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <IoPlayCircle size={24} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Retry Button */}
                        <motion.button
                            onClick={handleRetry}
                            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <IoCloseCircle size={20} />
                            Try Again
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ShazamView