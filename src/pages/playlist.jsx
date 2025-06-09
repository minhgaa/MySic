import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  IoPlayCircle, 
  IoPauseCircle, 
  IoHeartOutline, 
  IoHeart, 
  IoTimeOutline,
  IoMusicalNotesOutline,
  IoPersonOutline,
  IoEllipsisHorizontal
} from 'react-icons/io5';
import BaseView from '../components/BaseView';

const Playlist = () => {
  const location = useLocation();
  const playlistData = location.state || {
    name: "My Favorite Songs",
    description: "A collection of my all-time favorite tracks",
    songCount: 24,
    totalDuration: "1h 42m",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80"
  };

  const [currentPlaylist, setCurrentPlaylist] = useState(playlistData);

  const [songs, setSongs] = useState([
    {
      id: 1,
      title: "Starlight Dreams",
      artist: "Luna Eclipse",
      duration: "3:45",
      liked: true,
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80"
    },
    {
      id: 2,
      title: "Midnight Rain",
      artist: "Echo Valley",
      duration: "4:20",
      liked: false,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3"
    },
    {
      id: 3,
      title: "Electric Dreams",
      artist: "Neon Pulse",
      duration: "3:55",
      liked: true,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3"
    },
    {
      id: 4,
      title: "Ocean Waves",
      artist: "Coastal Beats",
      duration: "5:15",
      liked: false,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3"
    },
    {
      id: 5,
      title: "Urban Jungle",
      artist: "City Lights",
      duration: "4:10",
      liked: true,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3"
    }
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredSong, setHoveredSong] = useState(null);

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <BaseView>
      <div className="min-h-full bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-xl p-6">
        {/* Playlist Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-8 mb-8"
        >
          {/* Playlist Cover */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-60 h-60 rounded-lg overflow-hidden shadow-2xl"
          >
            <img 
              src={currentPlaylist.coverUrl} 
              alt={currentPlaylist.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Playlist Info */}
          <div className="flex flex-col justify-end">
            <h4 className="text-gray-400 mb-2">Playlist</h4>
            <h1 className="text-5xl font-bold text-white mb-4">{currentPlaylist.name}</h1>
            <p className="text-gray-400 mb-6">{currentPlaylist.description}</p>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <IoMusicalNotesOutline />
                <span>{currentPlaylist.songCount} songs</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline />
                <span>{currentPlaylist.totalDuration}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            {isPlaying ? (
              <IoPauseCircle size={64} />
            ) : (
              <IoPlayCircle size={64} />
            )}
          </motion.button>
        </motion.div>

        {/* Songs List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {/* Header */}
          <div className="grid grid-cols-[16px,1fr,1fr,1fr,48px] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-gray-700/50">
            <div>#</div>
            <div>Title</div>
            <div>Artist</div>
            <div>Duration</div>
            <div></div>
          </div>

          {/* Songs */}
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              variants={item}
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
              className={`grid grid-cols-[16px,1fr,1fr,1fr,48px] gap-4 p-4 rounded-lg ${
                hoveredSong === song.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="flex items-center text-gray-400">
                {hoveredSong === song.id ? (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-orange-500 hover:text-orange-400"
                  >
                    <IoPlayCircle size={16} />
                  </motion.button>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded overflow-hidden">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-medium">{song.title}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <span>{song.artist}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <span>{song.duration}</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={song.liked ? 'text-orange-500' : 'text-gray-400 hover:text-white'}
                >
                  {song.liked ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
                </motion.button>
                
                {hoveredSong === song.id && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 hover:text-white"
                  >
                    <IoEllipsisHorizontal size={20} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </BaseView>
  );
};

export default Playlist; 