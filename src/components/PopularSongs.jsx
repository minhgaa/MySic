import React, { useRef } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const songs = [
    { title: "Golden Days", artist: "Felix Carter", image: "src/assets/usuk.jpg", bg: "bg-orange-500" },
    { title: "Fading Horizon", artist: "Ella Hunt", image: "src/assets/vpop.jpg", bg: "bg-emerald-700" },
    { title: "Waves of Time", artist: "Lana Rivers", image: "src/assets/kpop.jpg", bg: "bg-blue-900" },
    { title: "Electric Dreams", artist: "Mia Lowell", image: "src/assets/vpop.jpg", bg: "bg-amber-600" },
    { title: "Shadows & Light", artist: "Ryan Miles", image: "src/assets/usuk.jpg", bg: "bg-cyan-800" },
    { title: "Echoes of Midnight", artist: "Jon Hickman", image: "src/assets/kpop.jpg", bg: "bg-red-800" },
    { title: "Golden Days", artist: "Felix Carter", image: "src/assets/usuk.jpg", bg: "bg-orange-500" },
    { title: "Fading Horizon", artist: "Ella Hunt", image: "src/assets/vpop.jpg", bg: "bg-emerald-700" },
    { title: "Waves of Time", artist: "Lana Rivers", image: "src/assets/kpop.jpg", bg: "bg-blue-900" },
    { title: "Electric Dreams", artist: "Mia Lowell", image: "src/assets/vpop.jpg", bg: "bg-amber-600" },
    { title: "Shadows & Light", artist: "Ryan Miles", image: "src/assets/usuk.jpg", bg: "bg-cyan-800" },
];

const PopularSongs = () => {
    const scrollRef = useRef(null);

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
                {songs.map((song, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl w-[130px] h-full flex-shrink-0 shadow-lg ${song.bg} relative flex flex-col items-center overflow-hidden`}
                    >
                        <img
                            src={song.image}
                            alt={song.title}
                            className="h-[70%] w-[95%] object-cover rounded-xl mt-1"
                        />
                        <div className="p-1 text-white flex flex-col items-center justify-center h-[30%] text-center">
                            <h3 className="text-[11px] font-semibold">{song.title}</h3>
                            <p className="text-[9px] text-gray-200">{song.artist}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularSongs;