import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { IoPlayOutline, IoPauseOutline } from "react-icons/io5";
import { useMusic } from '../contexts/MusicContext';

export default function SearchView({ query }) {
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong, currentSong, isPlaying } = useMusic();

  useEffect(() => {
    if (!query) {
      setSongs([]);
      setUsers([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/search?keywords=${query}`, {
          withCredentials: true
        });
        setSongs(response.data.songs || []);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="text-white flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="text-white space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Users Section */}
      {users.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <motion.div 
                key={user.id}
                className="bg-zinc-900/50 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors"
                variants={item}
              >
                <img 
                  src={user.avatarUrl || "/default-avatar.png"} 
                  alt={user.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-center truncate">{user.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Songs Section */}
      {songs.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Songs</h2>
          <div className="space-y-2">
            {songs.map((song) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isCurrentlyPlaying = isCurrentSong && isPlaying;

              return (
                <motion.div 
                  key={song.id}
                  className="relative group transition duration-300 cursor-pointer"
                  variants={item}
                  onClick={() => playSong(song)}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 shadow-md border 
                    ${isCurrentlyPlaying
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent"
                      : "bg-[#1C1C24] text-gray-300 border-transparent hover:border-orange-500/20 hover:bg-[#2A2A35] hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative group/image w-8 h-8">
                          <img
                            src={song.songImage}
                            alt={song.title}
                            className="w-8 h-8 rounded-full object-cover shadow-sm"
                          />
                          <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity
                            ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover/image:opacity-100'}`}
                          >
                            {isCurrentlyPlaying ? (
                              <IoPauseOutline className="text-white" size={16} />
                            ) : (
                              <IoPlayOutline className="text-white" size={16} />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col max-w-[120px]">
                          <span className={`font-semibold text-[10px] truncate ${
                            isCurrentSong ? 'text-white' : 'text-gray-300'
                          }`}>
                            {song.title}
                          </span>
                          <span className={`text-[8px] truncate ${
                            isCurrentSong 
                            ? 'text-white/80' 
                            : 'text-gray-400 group-hover:text-gray-300'
                          }`}>
                            {song.artist}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {!loading && songs.length === 0 && users.length === 0 && (
        <motion.p 
          className="text-gray-400 text-center py-8"
          variants={item}
        >
          No results found for "{query}"
        </motion.p>
      )}
    </motion.div>
  );
}