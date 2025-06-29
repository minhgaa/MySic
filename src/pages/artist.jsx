import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoPlayOutline, IoPauseOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { FaFacebookF, FaInstagram, FaYoutube, FaMusic } from "react-icons/fa";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import BaseView from "../components/BaseView";
import { useMusic } from "../contexts/MusicContext";
import axios from "axios";

const artistData = {
    name: "Thái Đinh",
    bio: "Thái Đinh là một ca sĩ kiêm nhạc sĩ nổi bật trong dòng nhạc Indie Việt Nam. Với chất giọng trầm ấm và phong cách sáng tác sâu lắng, anh đã chinh phục hàng triệu người nghe qua các ca khúc như 'Đi qua mùa hạ' hay 'Phố không em'. Xuất thân từ một người yêu âm nhạc và tự học sáng tác, Thái Đinh dần khẳng định tên tuổi trong cộng đồng yêu nhạc và từng bước vươn lên sân khấu chuyên nghiệp.",
    image: "/src/assets/thaidinh.jpg",
    coverImage: "/src/assets/thaidinh.jpg",
    followers: 1200000,
    monthlyListeners: 2500000,
    verified: true,
    socialLinks: {
        facebook: "https://facebook.com/thaidinhmusic",
        instagram: "https://instagram.com/thaidinhmusic",
        youtube: "https://youtube.com/thaidinhmusic"
    }
};

const albums = [
    {
        id: 1,
        title: "Đi qua mùa hạ",
        year: "2022",
        image: "/src/assets/thaidinh.jpg",
        songCount: 12,
        totalDuration: "48:30"
    },
    {
        id: 2,
        title: "Phố không em",
        year: "2021",
        image: "/src/assets/thaidinh.jpg",
        songCount: 10,
        totalDuration: "42:15"
    },
    {
        id: 3,
        title: "Những ngày yêu",
        year: "2020",
        image: "/src/assets/thaidinh.jpg",
        songCount: 8,
        totalDuration: "35:20"
    },
    {
        id: 4,
        title: "Acoustic Sessions",
        year: "2019",
        image: "/src/assets/thaidinh.jpg",
        songCount: 6,
        totalDuration: "28:45"
    }
];

const relatedArtists = [
    {
        id: 1,
        name: "Vũ",
        image: "/src/assets/jame.jpg",
        followers: 1500000
    },
    {
        id: 2,
        name: "Chillies",
        image: "/src/assets/jame.jpg",
        followers: 1200000
    },
    {
        id: 3,
        name: "Ngọt",
        image: "/src/assets/jame.jpg",
        followers: 900000
    },
    {
        id: 4,
        name: "Cá Hồi Hoang",
        image: "/src/assets/jame.jpg",
        followers: 800000
    },
    {
        id: 5,
        name: "Trang",
        image: "/src/assets/jame.jpg",
        followers: 700000
    }
];

const formatPlayCount = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
};

const durationToSeconds = (duration) => {
    if (!duration) return 0;
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
};

const secondsToDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getAudioDuration = async (url) => {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
        audio.addEventListener('error', () => {
            resolve(0);
        });
        audio.src = url;
    });
};

const Artist = () => {
    const { currentSong, isPlaying, playSong } = useMusic();
    const [topSongs, setTopSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [songLikes, setSongLikes] = useState({});
    const [artistStats, setArtistStats] = useState({
        totalSongs: 0,
        totalLikes: 0
    });

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/api/songs', {
                    withCredentials: true
                });
                
                // Lọc ra các bài hát của Thái Đinh
                let thaiDinhSongs = response.data
                    .filter(song => song.artist === "Thái Đinh");

                // Cập nhật số lượng bài hát
                setArtistStats(prev => ({
                    ...prev,
                    totalSongs: thaiDinhSongs.length
                }));

                // Lấy duration cho từng bài hát
                thaiDinhSongs = await Promise.all(
                    thaiDinhSongs.map(async (song) => {
                        if (song.fileUrl) {
                            const duration = await getAudioDuration(song.fileUrl);
                            return { ...song, duration: secondsToDuration(duration) };
                        }
                        return song;
                    })
                );

                // Fetch lượt thích cho mỗi bài hát
                const likesPromises = thaiDinhSongs.map(song =>
                    axios.get(`http://localhost:8080/api/songs/${song.id}/like`, {
                        withCredentials: true
                    })
                    .then(response => {
                        console.log('Response for songId:', song.id, response.data);
                        return { songId: song.id, likes: response.data.likeCount };
                    })
                    .catch(error => {
                        console.warn('Error fetching likes for songId:', song.id, error.message);
                        return { songId: song.id, likes: 0 };
                    })
                );

                const likesResults = await Promise.all(likesPromises);
                const likesMap = {};
                let totalLikes = 0;
                likesResults.forEach(result => {
                    likesMap[result.songId] = result.likes;
                    totalLikes += result.likes;
                });
                setSongLikes(likesMap);
                setArtistStats(prev => ({
                    ...prev,
                    totalLikes
                }));

                // Sắp xếp theo lượt thích và lấy 5 bài hát có nhiều lượt thích nhất
                thaiDinhSongs.sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0));
                setTopSongs(thaiDinhSongs.slice(0, 5));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching songs:", error);
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const handlePlayClick = (song) => {
        playSong(song);
    };

    const handleLike = async (songId) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/songs/${songId}/like`, {}, {
                withCredentials: true
            });
            
            setSongLikes(prev => ({
                ...prev,
                [songId]: response.data.likeCount
            }));
        } catch (error) {
            console.error("Error liking song:", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const bannerVariants = {
        hidden: { scale: 1.1, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <BaseView>
            <motion.div
                className="relative w-full mt-3 min-h-screen"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute bg-black inset-0 -z-10 rounded-3xl" />

                <div className="rounded-3xl w-full max-w-7xl mx-auto pb-8">
                    {/* Artist Banner */}
                    <motion.div 
                        className="relative rounded-t-3xl overflow-hidden h-[300px] shadow-xl"
                        variants={bannerVariants}
                    >
                        <img
                            src={artistData.coverImage}
                            alt={artistData.name}
                            className="w-full h-full object-cover"
                        />

                        <motion.div 
                            className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between pl-10 py-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="cursor-pointer"
                            >
                                <IoIosArrowBack size={25} className="text-gray-400 hover:text-white" />
                            </motion.div>
                            <motion.div 
                                className="flex-col justify-end"
                                variants={itemVariants}
                            >
                                <motion.h1 
                                    className="text-[48px] sm:text-[56px] font-bold text-white flex items-center gap-2"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {artistData.name}
                                    {artistData.verified && (
                                        <span className="text-blue-500 text-2xl">✓</span>
                                    )}
                                </motion.h1>
                                <motion.div 
                                    className="flex items-center gap-6 text-gray-200 text-sm"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaMusic className="text-orange-500" />
                                        <span>{artistStats.totalSongs} bài hát</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <IoHeart className="text-orange-500" />
                                        <span>{formatPlayCount(artistStats.totalLikes)} lượt thích</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Top Songs */}
                    <motion.section 
                        className="mt-10 px-5"
                        variants={itemVariants}
                    >
                        <motion.h2 
                            className="text-2xl font-bold text-white mb-5"
                            variants={itemVariants}
                        >
                            Bài hát nổi bật
                        </motion.h2>
                        {loading ? (
                            <div className="text-gray-400 text-center py-4">Đang tải...</div>
                        ) : topSongs.length > 0 ? (
                            <motion.div className="space-y-4">
                                {topSongs.map((song, idx) => {
                                    const isCurrentSong = currentSong?.id === song.id;
                                    const isCurrentlyPlaying = isCurrentSong && isPlaying;

                                    return (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/15 transition cursor-pointer"
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="flex items-center gap-4" onClick={() => handlePlayClick(song)}>
                                                <p className="text-gray-400 text-sm pr-5">{idx + 1}</p>
                                                <div className="relative group/image w-12 h-12">
                                                    <img
                                                        src={song.songImage || artistData.image}
                                                        alt={song.title}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                    <div className={`absolute inset-0 bg-black/40 rounded flex items-center justify-center transition-opacity
                                                        ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover/image:opacity-100'}`}>
                                                        {isCurrentlyPlaying ? (
                                                            <IoPauseOutline className="text-white" size={20} />
                                                        ) : (
                                                            <IoPlayOutline className="text-white" size={20} />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between w-[600px]">
                                                    <h3 className={`font-medium ${isCurrentSong ? 'text-orange-500' : 'text-white'}`}>
                                                        {song.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLike(song.id);
                                                            }}
                                                            className="text-gray-400 hover:text-orange-500 transition-colors"
                                                        >
                                                            {songLikes[song.id] > 0 ? (
                                                                <IoHeart className="text-orange-500" size={20} />
                                                            ) : (
                                                                <IoHeartOutline size={20} />
                                                            )}
                                                        </button>
                                                        <p className="text-gray-400 text-sm">{songLikes[song.id] || 0} lượt thích</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-[80px] items-center flex justify-between">
                                                <p className="text-gray-400 text-sm">{song.duration || "0:00"}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div className="text-gray-400 text-center py-4">Không tìm thấy bài hát nào</div>
                        )}
                    </motion.section>

                    {/* Albums */}
                    <motion.section 
                        className="mt-12 px-5"
                        variants={itemVariants}
                    >
                        <motion.h2 
                            className="text-2xl font-bold text-white mb-5"
                            variants={itemVariants}
                        >
                            Album
                        </motion.h2>
                        <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {albums.map((album, idx) => (
                                <motion.div
                                    key={idx}
                                    className="bg-transparent rounded-lg p-3 hover:bg-white/15 transition cursor-pointer"
                                    variants={itemVariants}
                                    whileHover={{ 
                                        scale: 1.05,
                                        transition: { type: "spring", stiffness: 300 }
                                    }}
                                >
                                    <img
                                        src={album.image}
                                        alt={album.title}
                                        className="rounded-lg mb-3 w-full aspect-square object-cover"
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex-col">
                                            <p className="text-white font-medium text-sm truncate">{album.title}</p>
                                            <p className="text-gray-400 text-xs">{album.year} • {album.songCount} bài hát</p>
                                        </div>
                                        <motion.button 
                                            className="text-white border border-transparent rounded-full p-2 hover:bg-orange-500 transition"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <IoPlayOutline size={30} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>

                    {/* About Artist */}
                    <motion.section 
                        className="mt-12 px-5"
                        variants={itemVariants}
                    >
                        <motion.h2 
                            className="text-2xl font-bold text-white mb-5"
                            variants={itemVariants}
                        >
                            Giới thiệu
                        </motion.h2>
                        <motion.div 
                            className="bg-white/10 rounded-xl p-5 text-gray-200 leading-relaxed backdrop-blur-sm"
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                        >
                            <motion.p 
                                className="mb-3"
                                variants={itemVariants}
                            >
                                {artistData.bio}
                            </motion.p>
                            <motion.div className="mt-5 flex gap-4">
                                {artistData.socialLinks.facebook && (
                                    <a 
                                        href={artistData.socialLinks.facebook} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <FaFacebookF size={16} />
                                        <span>Facebook</span>
                                    </a>
                                )}
                                {artistData.socialLinks.instagram && (
                                    <a 
                                        href={artistData.socialLinks.instagram} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <FaInstagram size={16} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {artistData.socialLinks.youtube && (
                                    <a 
                                        href={artistData.socialLinks.youtube} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <FaYoutube size={16} />
                                        <span>YouTube</span>
                                    </a>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.section>

                    {/* Related Artists */}
                    <motion.section 
                        className="mt-12 px-5"
                        variants={itemVariants}
                    >
                        <motion.h2 
                            className="text-2xl font-bold text-white mb-5"
                            variants={itemVariants}
                        >
                            Nghệ sĩ liên quan
                        </motion.h2>
                        <motion.div 
                            className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
                            variants={itemVariants}
                        >
                            {relatedArtists.map((artist, idx) => (
                                <motion.div 
                                    key={idx} 
                                    className="flex-shrink-0 w-24 text-center cursor-pointer"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <motion.img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="w-20 h-20 rounded-full object-cover mx-auto mb-2 shadow-md"
                                        whileHover={{ scale: 1.1 }}
                                    />
                                    <motion.p 
                                        className="text-white text-sm truncate"
                                        variants={itemVariants}
                                    >
                                        {artist.name}
                                    </motion.p>
                                    <motion.p 
                                        className="text-gray-400 text-xs truncate"
                                        variants={itemVariants}
                                    >
                                        {formatPlayCount(artist.followers)} người theo dõi
                                    </motion.p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>
                </div>
            </motion.div>
        </BaseView>
    );
};

export default Artist;