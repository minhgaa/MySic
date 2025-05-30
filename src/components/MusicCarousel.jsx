import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Box, Slider, Typography, IconButton, Avatar } from "@mui/material";
import { IoPlayOutline, IoPauseOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline } from "react-icons/io5";
const data = [
    {
        title: "Somebody that I used to know",
        artist: "Kygo",
        image: "src/assets/usuk.jpg"
    },
    {
        title: "Đi qua mùa hạ",
        artist: "Thái Đinh",
        image: "src/assets/vpop.jpg"
    },
    {
        title: "Gangnam Style",
        artist: "PSY",
        image: "src/assets/kpop.jpg"
    },
    {
        title: "Somebody that I used to know",
        artist: "Kygo",
        image: "src/assets/usuk.jpg"
    },
    {
        title: "Đi qua mùa hạ",
        artist: "Thái Đinh",
        image: "src/assets/vpop.jpg"
    },
    {
        title: "Gangnam Style",
        artist: "PSY",
        image: "src/assets/kpop.jpg"
    }
];

const Card = ({ image, title, artist, isActive }) => (
    <div
        className={`rounded-2xl overflow-hidden transition-all duration-500 ease-in-out
            ${isActive
                ? 'w-full max-w-[320px] scale-100 z-20 shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto'
                : 'w-full max-w-[240px] scale-90 brightness-75 z-10 shadow-md pointer-events-none'}
      `}
    >
        <img src={image} alt={title} className="w-full h-[280px] object-cover sm:h-[300px] md:h-[350px]" />
        {isActive && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-row justify-between items-center px-4 py-2 text-white">
                <div className="w-2/3 p-2">
                    <h2 className="text-sm md:text-lg font-bold">{title}</h2>
                    <p className="text-xs md:text-sm text-gray-200">{artist}</p>
                </div>
                <IconButton
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        color: "white",
                    }}
                >
                    <IoPlayOutline size={24} />
                </IconButton>
            </div>
        )}
    </div>
);

const Carousel = () => {
    const [activeIndex, setActiveIndex] = useState(2);

    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveIndex((i) => Math.min(i + 1, data.length - 1)),
        onSwipedRight: () => setActiveIndex((i) => Math.max(i - 1, 0)),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <div className="w-full flex justify-center items-center">
            <button
                onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
                className="hover:text-white text-gray-400 font-bold py-2 px-3 rounded-full"
            >
                <IoChevronBackOutline size={24} />
            </button>

            <div {...handlers} className="relative flex items-center justify-center w-full h-[300px] sm:h-[330px] md:h-[370px] overflow-hidden">
                {data.map((item, i) => {
                    const offset = i - activeIndex;
                    const isActive = i === activeIndex;

                    return (
                        <div
                            key={i}
                            className={`absolute transition-transform duration-500 ease-in-out`}
                            style={{
                                transform: `translateX(${offset * 160}px) scale(${isActive ? 1 : 0.95}) rotateY(${isActive ? 0 : offset > 0 ? -10 : 10}deg)`,
                                zIndex: 100 - Math.abs(offset),
                                opacity: Math.abs(offset) > 2 ? 0 : 1,
                            }}
                        >
                            <Card {...item} isActive={isActive} />
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => setActiveIndex((i) => Math.min(i + 1, data.length - 1))}
                className="hover:text-white text-gray-400 font-bold py-2 px-3 rounded-full"
            >
                <IoChevronForwardOutline size={24} />
            </button>
        </div>
    );
};

export default Carousel;