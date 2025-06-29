import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

const ListCategory = ({ selectedCategory, onCategoryChange }) => {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [genreSongs, setGenreSongs] = useState({})

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/genres', {
          withCredentials: true
        })
        setGenres(response.data)
        // Fetch songs for each genre
        response.data.forEach(genre => {
          fetchSongsByGenre(genre.id)
        })
      } catch (error) {
        console.error('Error fetching genres:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  const fetchSongsByGenre = async (genreId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/songs/by-genre?genreId=${genreId}`, {
        withCredentials: true
      })
      setGenreSongs(prev => ({
        ...prev,
        [genreId]: response.data.length
      }))
    } catch (error) {
      console.error(`Error fetching songs for genre ${genreId}:`, error)
    }
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-l font-semibold mb-4 text-white">Select Categories</h2>
        <div className="flex flex-wrap gap-3 mb-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
                delay: i * 0.2
              }}
              className="bg-gray-700 h-8 w-20 rounded-full"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-l font-semibold mb-4 text-white">Select Categories</h2>
      <motion.div 
        className="flex flex-wrap gap-3 mb-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {genres.map((genre) => (
          <motion.button
            key={genre.id}
            onClick={() => onCategoryChange(genre.id)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`px-4 py-1 rounded-full text-sm transition-colors flex items-center gap-2
              ${genre.id === selectedCategory
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <span>{genre.name}</span>
            <motion.span 
              className={`text-xs px-2 py-0.5 rounded-full
                ${genre.id === selectedCategory 
                  ? "bg-emerald-500/20" 
                  : "bg-black/20"}`}
              initial={false}
              animate={{
                scale: genreSongs[genre.id] ? [1, 1.2, 1] : 1
              }}
              transition={{
                duration: 0.3,
                times: [0, 0.5, 1]
              }}
            >
              {genreSongs[genre.id] || 0}
            </motion.span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

export default ListCategory