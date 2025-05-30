import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/navbar'
import MusicPlaybar from '../components/musicplaybar'
import PopularSongs from '../components/PopularSongs'
import ListCategory from '../components/ListCategory'
import Header from '../components/header'
import CategoryBanner from '../components/categorybanner'
import BaseView from '../components/BaseView'

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("Pop")

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

  return (
    <BaseView>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="my-4" variants={itemVariants}>
          <CategoryBanner category={selectedCategory} />
        </motion.div>
        <motion.div className="mt-6" variants={itemVariants}>
          <ListCategory
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <motion.div 
            className="mt-auto"
            variants={itemVariants}
          >
            <PopularSongs />
          </motion.div>
        </motion.div>
      </motion.div>
    </BaseView>
  )
}

export default Category