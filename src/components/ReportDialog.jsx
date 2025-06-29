import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoWarningOutline, IoCheckmarkCircle, IoAlertCircle, IoCalendarOutline } from 'react-icons/io5';
import axios from 'axios';
import { useAuth } from '../hooks/authContext';

const ReportDialog = ({ isOpen, onClose, contentType = 'song', contentTitle = '', song }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare report data according to the schema
      const reportData = {
        userId: user?.id,
        songId: song?.id, 
        reason: description.trim(),
      };

      // Call API to submit report
      await axios.post('http://localhost:8080/api/report', reportData, {
        withCredentials: true
      });
      
      setIsSubmitted(true);
      
      // Reset and close after showing success message
      setTimeout(() => {
        setIsSubmitted(false);
        setDescription('');
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  const dialogVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const successVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.5
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <motion.div
            className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-xl"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IoClose size={20} />
            </motion.button>

            {/* Content */}
            <div className="p-6">
              <motion.h2 
                className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <IoWarningOutline className="text-orange-500" size={24} />
                Report Content
              </motion.h2>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  {/* Song Info */}
                  <motion.div 
                    className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative group">
                      <img 
                        src={song?.songImage || "/default-song.png"}
                        alt={contentTitle}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <motion.div 
                        className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.05 }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{contentTitle}</h3>
                      <p className="text-gray-400 text-sm">{song?.artist || 'Unknown Artist'}</p>
                      <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                        <IoCalendarOutline size={12} />
                        <span>Added {new Date(song?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-white font-medium mb-2">
                      Why are you reporting this content?
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setError(null);
                      }}
                      placeholder="Please describe the issue in detail..."
                      className={`w-full h-32 px-4 py-3 bg-zinc-800 text-white rounded-xl border focus:ring-2 focus:outline-none resize-none placeholder:text-gray-500 transition-colors ${
                        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20'
                      }`}
                      required
                    />
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 text-red-500 rounded-lg"
                      >
                        <IoAlertCircle size={20} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div 
                    className="flex justify-end gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={!description.trim() || isSubmitting}
                      className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 ${
                        description.trim() ? 'bg-orange-500 hover:bg-orange-600' : 'bg-zinc-700 cursor-not-allowed'
                      } transition-colors`}
                      whileHover={description.trim() ? { scale: 1.02 } : {}}
                      whileTap={description.trim() ? { scale: 0.98 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <IoWarningOutline size={18} />
                          <span>Submit Report</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              ) : (
                <motion.div
                  className="text-center py-8"
                  initial="hidden"
                  animate="visible"
                  variants={successVariants}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                  >
                    <IoCheckmarkCircle className="mx-auto text-5xl text-emerald-500 mb-4" />
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-semibold text-white mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Thank you for your report!
                  </motion.h3>
                  <motion.p 
                    className="text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    We will review your report as soon as possible.
                  </motion.p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportDialog; 