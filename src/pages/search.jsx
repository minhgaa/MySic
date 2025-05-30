import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchView({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const res = await fetch(
        `https://shazam.p.rapidapi.com/search?term=${query}&locale=en-US&offset=0&limit=5`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '3a0a074ef5msh78da562af0c50e5p101e86jsn792cff583b0a',
            'X-RapidAPI-Host': 'shazam-api6.p.rapidapi.com',
          },
        }
      );
      const data = await res.json();
      setResults(data.tracks?.hits || []);
    };

    fetchResults();
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
    hidden: { x: -20, opacity: 0 },
    show: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="text-white"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="wait">
        {results.map((track, idx) => (
          <motion.div 
            key={idx} 
            className="mb-2 p-4 rounded-lg hover:bg-white/10 transition-colors"
            variants={item}
            layout
          >
            <p className="font-bold">{track.track.title}</p>
            <p className="text-sm text-gray-400">{track.track.subtitle}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}