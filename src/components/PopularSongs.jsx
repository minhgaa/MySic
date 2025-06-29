import React, { useRef } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useMusic } from "../contexts/MusicContext";

const PopularSongs = ({ songs = [] }) => {
    const scrollRef = useRef(null);
    const { playSong, currentSong, isPlaying } = useMusic();

    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -180 : 180,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full h-full text-white">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-l font-semibold">Popular songs</h2>
                <div className="flex gap-3">
                    <button onClick={() => scroll("left")} className="p-2 hover:text-white text-gray-400 rounded-full">
                        <IoChevronBackOutline size={20} />
                    </button>
                    <button onClick={() => scroll("right")} className="p-2 hover:text-white text-gray-400 rounded-full">
                        <IoChevronForwardOutline size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="h-[160px] flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth"
            >
                {songs.map((song, i) => {
                    const isCurrentSong = currentSong?.id === song.id;
                    const isCurrentlyPlaying = isCurrentSong && isPlaying;

                    return (
                    <div
                            key={song.id}
                            onClick={() => playSong(song)}
                            className={`rounded-2xl w-[130px] h-full flex-shrink-0 shadow-lg relative flex flex-col items-center overflow-hidden cursor-pointer transition-all duration-300
                                ${isCurrentlyPlaying 
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                                    : 'bg-zinc-800 hover:bg-zinc-700'}`}
                    >
                        <img
                                src={song.songImage || "/default-song.png"}
                            alt={song.title}
                            className="h-[70%] w-[95%] object-cover rounded-xl mt-1"
                        />
                        <div className="p-1 text-white flex flex-col items-center justify-center h-[30%] text-center">
                                <h3 className="text-[11px] font-semibold truncate w-full">{song.title}</h3>
                                <p className="text-[9px] text-gray-200 truncate w-full">{song.artist}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PopularSongs;