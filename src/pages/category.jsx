import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Navbar from '../components/navbar'
import MusicPlaybar from '../components/musicplaybar'
import PopularSongs from '../components/PopularSongs'
import ListCategory from '../components/ListCategory'
import Header from '../components/header'
import CategoryBanner from '../components/categorybanner'
import BaseView from '../components/BaseView'

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (selectedCategory) {
      fetchSongsByGenre()
    }
  }, [selectedCategory])

  const fetchSongsByGenre = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8080/api/songs/by-genre?genreId=${selectedCategory}`, {
        withCredentials: true
      })
      setSongs(response.data)
    } catch (error) {
      console.error('Error fetching songs:', error)
      setError('Failed to load songs')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

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

  return (
    <BaseView>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-4"
      >
        <motion.div 
          className="my-4" 
          variants={itemVariants}
        >
          <CategoryBanner category={selectedCategory} />
        </motion.div>

        <motion.div 
          className="mt-6" 
          variants={itemVariants}
        >
          <ListCategory
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <motion.div 
            className="mt-8"
            variants={itemVariants}
          >
            {loading ? (
              <motion.div 
                className="flex items-center justify-center h-64"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            ) : error ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-64"
              >
                <p className="text-red-500 mb-4">{error}</p>
                <motion.button
                  onClick={fetchSongsByGenre}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Thử lại
                </motion.button>
              </motion.div>
            ) : songs.length > 0 ? (
              <PopularSongs songs={songs} />
            ) : (
              <motion.div 
                className="text-gray-400 text-center py-8"
                variants={buttonVariants}
                whileHover="hover"
              >
                Chưa có bài hát nào trong thể loại này
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </BaseView>
  )
}

export default Category