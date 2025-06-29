import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning, IoClose } from 'react-icons/io5';

const icons = {
  success: IoCheckmarkCircle,
  error: IoCloseCircle,
  info: IoInformationCircle,
  warning: IoWarning
};

const colors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500'
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const Icon = icons[type];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-[99999] pointer-events-auto"
    >
      <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 pr-12 backdrop-blur-sm bg-opacity-90`}>
        <Icon className="text-xl flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <IoClose />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast; 