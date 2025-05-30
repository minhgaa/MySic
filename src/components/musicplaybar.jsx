import { useState } from "react";
import { Box, Slider, Typography, IconButton, Avatar } from "@mui/material";
import { AiOutlineHeart } from "react-icons/ai";
import { IoPlayOutline, IoPauseOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline } from "react-icons/io5";
import { BiVolumeFull } from "react-icons/bi";
import { PiShuffle, PiRepeat } from "react-icons/pi";

export default function MusicPlaybar() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(53);
    const duration = 238;

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (_, newValue) => {
        setProgress(newValue);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };


    return (
        <Box className="bg-[#191B20] w-full h-full flex items-center justify-between px-4 py-2 rounded-lg">
            <Box className="flex items-center space-x-4">
                <Avatar src="/src/assets/usuk.jpg" sx={{ width: 40, height: 40 }} />
                <Box>
                    <Typography sx={{ color: "white", fontFamily: "Montserrat", fontSize: "14px", fontWeight: "bold" }}>
                        Echoes of Midnight
                    </Typography>
                    <Typography sx={{ color: "gray", fontFamily: "Montserrat", fontSize: "12px" }}>Jon Hickman</Typography>
                </Box>
            </Box>

            <Box className="flex items-center space-x-4">
                <IconButton sx={{ color: "white" }}>
                    <IoPlaySkipBackOutline size={22} />
                </IconButton>
                <IconButton
                    onClick={togglePlay}
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        color: "white",
                    }}
                >
                    {isPlaying ? <IoPauseOutline size={28} /> : <IoPlayOutline size={28} />}
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                    <IoPlaySkipForwardOutline size={22} />
                </IconButton>
            </Box>

            <Box className="flex flex-col justify-center items-center h-2/3 w-1/3">
                <Slider
                    value={progress}
                    onChange={handleProgressChange}
                    min={0}
                    max={duration}
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
                <IconButton sx={{ color: "white" }}>
                    <AiOutlineHeart size={20} />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                    <PiShuffle size={20} />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                    <PiRepeat size={20} />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                    <BiVolumeFull size={20} />
                </IconButton>
            </Box>
        </Box>
    );
}
