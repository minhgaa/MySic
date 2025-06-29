import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import popImg from '../assets/pop.jpg'
import rockImg from '../assets/rock.jpg'
import partyImg from '../assets/party.jpg'
import romanceImg from '../assets/romance.jpg'
import energeticImg from '../assets/energetic.jpg'
import relaxingImg from '../assets/relaxing.jpg'
import jazzImg from '../assets/jazz.jpg'
import alternativeImg from '../assets/jazz.jpg'
import allImg from '../assets/all.jpg'

const bannerInfo = {
  "Acoustic": {
    image: romanceImg,
    description: "Unplugged and intimate tracks for a natural sound experience."
  },
  "Chill": {
    image: relaxingImg,
    description: "Laid-back music to help you relax and unwind."
  },
  "Classical": {
    image: alternativeImg,
    description: "Timeless masterpieces from the greatest composers."
  },
  "Country": {
    image: partyImg,
    description: "Authentic sounds of country music and heartfelt lyrics."
  },
  "Dance": {
    image: energeticImg,
    description: "Non-stop hits to keep you moving all night long."
  },
  "EDM": {
    image: energeticImg,
    description: "Pulsing beats and festival anthems from top EDM artists."
  },
  "Hip Hop": {
    image: allImg,
    description: "The hottest tracks in hip hop, fresh from the streets."
  },
  "Indie": {
    image: jazzImg,
    description: "Explore fresh and unique sounds from the indie scene."
  },
  "Pop": {
    image: popImg,
    description: "Chart-topping hits and the best of modern pop music."
  },
  "Rock": {
    image: rockImg,
    description: "Feel the energy of classic and modern rock hits."
  }
};

const CategoryBanner = ({ category }) => {
  const [genreInfo, setGenreInfo] = useState(null)

  useEffect(() => {
    const fetchGenre = async () => {
      if (category) {
        try {
          const response = await axios.get(`http://localhost:8080/api/genres/${category}`, {
            withCredentials: true
          })
          console.log('Genre fetched:', response.data)
          setGenreInfo(response.data)
        } catch (error) {
          console.error('Error fetching genre:', error)
        }
      }
    }

    fetchGenre()
  }, [category])

  const info = genreInfo ? (bannerInfo[genreInfo.name] || {
    image: allImg,
    description: "Discover amazing songs in this category."
  }) : {
    image: allImg,
    description: "Discover and enjoy your favorite music."
  }

  return (
    <motion.div 
      className="relative w-full md:h-[153px] lg:h-[280px] xl:h-[315px] overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={category || 'default'}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {/* Fullscreen background image with animation */}
          <motion.img
            src={info.image}
            alt={genreInfo?.name || 'Welcome'}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ 
              scale: 1,
              filter: ["brightness(1.2)", "brightness(1)"]
            }}
            transition={{
              scale: {
                duration: 0.8,
                ease: "easeOut"
              },
              filter: {
                duration: 1
              }
            }}
          />

          {/* Gradient overlay with dynamic animation */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            initial={{ opacity: 0, backgroundPosition: "0% 100%" }}
            animate={{ 
              opacity: 1,
              backgroundPosition: "0% 0%",
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
          />

          {/* Content with staggered animation */}
          <motion.div 
            className="relative z-10 flex flex-col justify-end h-full p-8 text-white"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            <motion.h2 
              className="text-5xl font-bold mb-2"
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }
              }}
            >
              {genreInfo?.name || "Welcome to Mysic"}
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-200 max-w-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }
              }}
            >
              {info.description}
            </motion.p>

            {/* Optional decorative elements */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default CategoryBanner