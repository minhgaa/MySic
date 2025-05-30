import React from "react";
import { motion } from "framer-motion";
import { IoPlayOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import BaseView from "../components/BaseView";

const topSongs = [
  { title: "Đi qua mùa hạ", plays: 4211232, image: "/images/song1.jpg" },
  { title: "Phố không em", plays: 3232322, image: "/images/song2.jpg" },
  { title: "Em còn dùng số này không", plays: 3000302, image: "/images/song3.jpg" },
];

const albums = [
  { title: "Midnights", year: "2022", image: "/images/album1.jpg" },
  { title: "1989", year: "2014", image: "/images/album2.jpg" },
  { title: "Red", year: "2012", image: "/images/album3.jpg" },
];

const relatedArtists = [
  { name: "Ariana Grande", image: "/images/ariana.jpg" },
  { name: "Ed Sheeran", image: "/images/ed.jpg" },
  { name: "Billie Eilish", image: "/images/billie.jpg" },
];
const formatPlayCount = (num) => {
  return num.toLocaleString(); 
};

const Artist = () => {
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
              src="src/assets/thaidinh.jpg"
              alt="artist"
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
              >
                <IoIosArrowBack size={25} className="text-gray-400 hover:text-white" />
              </motion.div>
              <motion.div 
                className="flex-col justify-end"
                variants={itemVariants}
              >
                <motion.h1 
                  className="text-[48px] sm:text-[56px] font-bold text-white"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Thái Đinh
                </motion.h1>
                <motion.p 
                  className="text-gray-200 text-sm"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  120 Songs · 10M Followers
                </motion.p>
                <motion.button 
                  className="mt-4 px-6 py-2 w-fit rounded-full bg-orange-600 text-sm font-medium hover:bg-orange-700 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Follow
                </motion.button>
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
              Top Songs
            </motion.h2>
            <motion.div className="space-y-4">
              {topSongs.map((song, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/15 transition"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <p className="text-gray-400 text-sm pr-5">{idx + 1}</p>
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex items-center justify-between w-[600px]">
                      <h3 className="font-medium text-white">{song.title}</h3>
                      <p className="text-gray-400 text-sm">{formatPlayCount(song.plays)}</p>
                    </div>
                  </div>
                  <div className="w-[80px] items-center flex justify-between">
                    <p className="text-gray-400 text-sm">4:30</p>
                    <motion.button 
                      className="text-white border border-transparent rounded-full p-2 hover:bg-orange-500 transition"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoPlayOutline size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
              Albums
            </motion.h2>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {albums.map((album, idx) => (
                <motion.div
                  key={idx}
                  className="bg-transparent rounded-lg p-3 hover:bg-white/15 transition"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <img
                    src={album.image}
                    alt={album.title}
                    className="rounded-lg mb-3 w-full object-cover"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex-col">
                      <p className="text-white font-medium text-sm truncate">{album.title}</p>
                      <p className="text-gray-400 text-xs">{album.year}</p>
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
              About
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
                Thái Đinh là một ca sĩ kiêm nhạc sĩ nổi bật trong dòng nhạc Indie Việt Nam. Với chất giọng trầm ấm và phong cách sáng tác sâu lắng, anh đã chinh phục hàng triệu người nghe qua các ca khúc như <em>"Đi qua mùa hạ"</em> hay <em>"Phố không em"</em>.
              </motion.p>
              <motion.p 
                className="mb-3"
                variants={itemVariants}
              >
                Xuất thân từ một người yêu âm nhạc và tự học sáng tác, Thái Đinh dần khẳng định tên tuổi trong cộng đồng yêu nhạc và từng bước vươn lên sân khấu chuyên nghiệp.
              </motion.p>
              <motion.p
                variants={itemVariants}
              >
                Với hơn 10 triệu lượt theo dõi và 120 ca khúc được phát hành, Thái Đinh là một trong những nghệ sĩ trẻ có sức ảnh hưởng lớn trong nền âm nhạc đương đại Việt Nam.
              </motion.p>
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
              Related Artists
            </motion.h2>
            <motion.div 
              className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
              variants={itemVariants}
            >
              {relatedArtists.map((artist, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex-shrink-0 w-24 text-center"
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