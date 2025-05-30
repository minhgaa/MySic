import React, { useRef } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const artists = [
    { artist: "Felix Carter", image: "src/assets/usuk.jpg", bg: "bg-orange-500" },
    { artist: "Ella Hunt", image: "src/assets/vpop.jpg", bg: "bg-emerald-700" },
    { artist: "Lana Rivers", image: "src/assets/kpop.jpg", bg: "bg-blue-900" },
    { artist: "Mia Lowell", image: "src/assets/vpop.jpg", bg: "bg-amber-600" },
    { artist: "Ryan Miles", image: "src/assets/usuk.jpg", bg: "bg-cyan-800" },
    { artist: "Jon Hickman", image: "src/assets/kpop.jpg", bg: "bg-red-800" },
    { artist: "Felix Carter", image: "src/assets/usuk.jpg", bg: "bg-orange-500" },
    { artist: "Ella Hunt", image: "src/assets/vpop.jpg", bg: "bg-emerald-700" },
    { artist: "Lana Rivers", image: "src/assets/kpop.jpg", bg: "bg-blue-900" },
    { artist: "Mia Lowell", image: "src/assets/vpop.jpg", bg: "bg-amber-600" },
    { artist: "Ryan Miles", image: "src/assets/usuk.jpg", bg: "bg-cyan-800" },
];

const PopularArtists = () => {
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
                <h2 className="text-l font-semibold">Popular Artist</h2>
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
                className="h-[180px] flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-2"
            >
                {artists.map((artist, index) => (
                    <div
                        key={index}
                        className="w-[150px] flex-shrink-0 flex flex-col items-center text-center"
                    >
                        <div className="w-[130px] h-[130px] rounded-full overflow-hidden">
                            <img
                                src={artist.image}
                                alt={artist.artist}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-[11px] font-bold text-gray-300 mt-2">{artist.artist}</p>
                        <p className="text-[8px] font-normal text-gray-300">Artist</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularArtists;