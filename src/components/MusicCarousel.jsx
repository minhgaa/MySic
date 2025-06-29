import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Box, IconButton } from "@mui/material";
import { IoPlayOutline, IoPauseOutline } from "react-icons/io5";
import axios from 'axios';
import { useMusic } from '../contexts/MusicContext';

const Card = ({ song, isActive }) => {
    const { playSong, currentSong, isPlaying } = useMusic();
    const isCurrentSong = currentSong?.fileUrl === song.fileUrl;

    return (
    <div
        className={`rounded-2xl overflow-hidden transition-all duration-500 ease-in-out
            ${isActive
                ? 'w-full max-w-[320px] scale-100 z-20 shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto'
                : 'w-full max-w-[240px] scale-90 brightness-75 z-10 shadow-md pointer-events-none'}
      `}
    >
            <img src={song.songImage} alt={song.title} className="w-full h-[280px] object-cover sm:h-[300px] md:h-[350px]" />
        {isActive && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-row justify-between items-center px-4 py-2 text-white">
                <div className="w-2/3 p-2">
                        <h2 className="text-sm md:text-lg font-bold">{song.title}</h2>
                        <p className="text-xs md:text-sm text-gray-200">{song.artist}</p>
                </div>
                <IconButton
                        onClick={() => playSong(song)}
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        color: "white",
                    }}
                >
                        {isCurrentSong && isPlaying ? <IoPauseOutline size={24} /> : <IoPlayOutline size={24} />}
                </IconButton>
            </div>
        )}
    </div>
);
};

const LoadingCard = () => (
    <div className="w-full max-w-[320px] rounded-2xl overflow-hidden">
        <div className="w-full h-[350px] bg-zinc-800 animate-pulse"></div>
    </div>
);

const Carousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/api/songs', {
                    withCredentials: true
                });
                console.log('Fetched songs:', response.data);
                setSongs(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching recommended songs:', err);
                setError('Failed to load recommended songs');
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveIndex((i) => Math.min(i + 1, songs.length - 1)),
        onSwipedRight: () => setActiveIndex((i) => Math.max(i - 1, 0)),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center">
                <LoadingCard />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center text-red-500">
                {error}
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className="w-full flex justify-center items-center text-gray-400">
                No recommended songs available
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center items-center">
            <button
                onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
                className="hover:text-white text-gray-400 font-bold py-2 px-3 rounded-full"
                disabled={activeIndex === 0}
            >
                <IoChevronBackOutline size={24} />
            </button>

            <div {...handlers} className="relative flex items-center justify-center w-full h-[300px] sm:h-[330px] md:h-[370px] overflow-hidden">
                {songs.map((song, i) => {
                    const offset = i - activeIndex;
                    const isActive = i === activeIndex;

                    return (
                        <div
                            key={song._id || i}
                            className={`absolute transition-transform duration-500 ease-in-out`}
                            style={{
                                transform: `translateX(${offset * 160}px) scale(${isActive ? 1 : 0.95}) rotateY(${isActive ? 0 : offset > 0 ? -10 : 10}deg)`,
                                zIndex: 100 - Math.abs(offset),
                                opacity: Math.abs(offset) > 2 ? 0 : 1,
                            }}
                        >
                            <Card 
                                song={song}
                                isActive={isActive} 
                            />
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => setActiveIndex((i) => Math.min(i + 1, songs.length - 1))}
                className="hover:text-white text-gray-400 font-bold py-2 px-3 rounded-full"
                disabled={activeIndex === songs.length - 1}
            >
                <IoChevronForwardOutline size={24} />
            </button>
        </div>
    );
};

export default Carousel;