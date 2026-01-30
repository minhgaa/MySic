import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BaseView from '../components/BaseView';
import MusicCarousel from '../components/MusicCarousel';
import PopularArtists from '../components/PopularArtist';
import MusicPlayerPage from './musicplayer';
import SearchView from './search';
import ShazamView from './Shazam';

const Mainpage = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [isShazamClicked, setIsShazamClicked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <BaseView setIsSearching={setIsSearching} setSearchQuery={setSearchQuery} setIsShazamClicked={setIsShazamClicked}>
      <motion.div
        className="grid grid-cols-4 w-full h-full"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div className="col-span-3  w-full h-full pr-6">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SearchView query={searchQuery} />
              </motion.div>
            ) : isShazamClicked ? 
            (<motion.div
              key="shazam"
              className='h-full w-full'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ShazamView />
            </motion.div>) :
              (
                <motion.div
                  key="main"
                  variants={pageVariants}
                >
                  <motion.div
                    className="my-4"
                    variants={itemVariants}
                  >
                    <MusicCarousel />
                  </motion.div>
                  <motion.div
                    className="mt-6"
                    variants={itemVariants}
                  >
                    <PopularArtists />
                  </motion.div>
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          className="col-span-1 w-full overflow-y-scroll"
          variants={itemVariants}
        >
          <MusicPlayerPage />
        </motion.div>
      </motion.div>
    </BaseView>
  );
};

export default Mainpage;