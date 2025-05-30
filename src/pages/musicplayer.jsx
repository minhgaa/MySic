import { CiMicrophoneOn, CiSaveDown1 } from "react-icons/ci";
import { RiPlayListAddLine } from "react-icons/ri";
import { FaMusic } from "react-icons/fa";

const songs = [
    {
        id: 1,
        title: "Dance Alone",
        artist: "Kylie Minogue",
        year: "2024",
        duration: "04:30",
        image: "/src/assets/vpop.jpg",
        isPlaying: false,
    },
    {
        id: 2,
        title: "Flowers",
        artist: "Miley Cyrus",
        year: "2023",
        duration: "03:15",
        image: "/src/assets/kpop.jpg",
        isPlaying: true,
    },
    {
        id: 3,
        title: "Paint The Town Red",
        artist: "Doja Cat",
        year: "2023",
        duration: "05:30",
        image: "/src/assets/usuk.jpg",
        isPlaying: false,
    },
    {
        id: 4,
        title: "Who I Am",
        artist: "Unknown Artist",
        year: "2024",
        duration: "04:10",
        image: "/src/assets/caroutside.jpeg",
        isPlaying: false,
    },
];

export default function MusicPlayerPage() {
    return (
        <div className="w-full h-full bg-slate-950 rounded-lg">
            <div className="relative w-full h-[400px]">
                <img
                    src="src/assets/jamearthur.jpg"
                    className="absolute w-full h-full object-cover rounded-t-lg"
                    alt="Album"
                />
                <div className="relative z-10 flex flex-col py-5 px-5 bg-black/40 h-full justify-end items-start rounded-lg">
                    <div className="text-xl font-bold text-white text-center">
                        Car's Outside
                    </div>
                    <span className="font-medium text-sm text-gray-300 text-center mt-1">
                        James Arthur
                    </span>
                    <div className="flex justify-center gap-5 mt-4 text-white">
                        <CiMicrophoneOn size={20} />
                        <RiPlayListAddLine size={20} />
                        <CiSaveDown1 size={20} />
                    </div>
                </div>
            </div>
            <div className="pb-5 rounded-2xl relative z-20">
                <div className="w-full bg-[#191B20] rounded-2xl pt-5 pb-5 shadow-xl">
                    <div className="flex flex-col w-full h-full items-start px-5">
                        <span className="text-white text-sm font-semibold mb-1">
                            Next songs
                        </span>
                        <div className="w-full p-2 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar">
                            {songs.map((song) => (
                                <div key={song.id} className="relative group transition duration-300">
                                    {song.isPlaying && (
                                        <div className="absolute -left-5 top-1/2 transform -translate-y-1/2">
                                            <FaMusic className="text-orange-500 animate-pulse" size={12} />
                                        </div>
                                    )}

                                    <div
                                        className={`p-2 rounded-xl transition-all duration-300 shadow-md border 
                                ${song.isPlaying
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent"
                                                : "bg-[#1C1C24] text-gray-300 border-transparent group-hover:border-orange-500 group-hover:bg-[#2A2A35] group-hover:shadow-lg"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={song.image}
                                                    alt={song.title}
                                                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[10px] truncate">{song.title}</span>
                                                    <span className="text-[8px] text-gray-400 group-hover:text-gray-200">
                                                        {song.artist}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 group-hover:text-gray-200">
                                                {song.duration}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className=" h-[300px] bg-[#191B20] rounded-2xl  w-full">
                <div className="relative h-[180px] ">
                    <img
                        className="w-full h-full rounded-t-2xl absolute object-cover object-top opacity-70"
                        src="src/assets/jame.jpg"
                        alt="Artist"
                    />
                    <span className="relative text-white text-sm font-semibold p-5 block drop-shadow-lg">
                        About the Artist
                    </span>

                </div>
                <div className="h-[120px] p-5 flex flex-col justify-center text-white">
                    <div className="flex justify-between">
                        <h3 className="text-base font-bold">James Arthur</h3>
                        <button className="bg-orange-600 rounded-full text-[10px] p-1 px-2 text-white">Follow</button>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-2">
                        James Smith is a renowned artist known for his soulful music and inspiring lyrics.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Genres: Pop, Soul, R&B</p>
                </div>
            </div>
        </div>
    );
}