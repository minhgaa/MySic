import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  IoFlagOutline, 
  IoCalendarOutline, 
  IoPersonOutline,
  IoMusicalNotesOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

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
  hidden: { 
    y: 20, 
    opacity: 0,
    scale: 0.95
  },
  show: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, songTitle }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
                <IoAlertCircleOutline size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Confirm Action</h3>
            </div>

            <p className="text-gray-300 mb-6">
              This action will remove "{songTitle}" due to violation. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Remove Song
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ListReports = ({ reports = [], onReportClick, onActionClick }) => {
  const [detailedReports, setDetailedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    songId: null,
    reportId: null,
    songTitle: ''
  });

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        // Fetch all reports first
        const reportsResponse = await axios.get(
          'http://localhost:8080/api/report',
          { withCredentials: true }
        );

        const reports = reportsResponse.data;

        // Then fetch details for each report
        const detailedData = await Promise.all(
          reports.map(async (report) => {
            try {
              // Fetch song details
              const songResponse = await axios.get(
                `http://localhost:8080/api/songs/${report.songId}`,
                { withCredentials: true }
              );

              // Fetch reporter details
              const reporterResponse = await axios.get(
                `http://localhost:8080/api/users/by-id/${report.userId}`,
                { withCredentials: true }
              );

              // Combine all data
              return {
                reportId: report.id,
                description: report.reason,
                createdAt: report.createdAt,
                song: {
                  _id: report.songId,
                  ...songResponse.data
                },
                reporter: {
                  _id: report.userId,
                  name: reporterResponse.data.name,
                  email: reporterResponse.data.email,
                  avatarUrl: reporterResponse.data.avatarUrl
                }
              };
            } catch (error) {
              console.error(`Error fetching details for report ${report.id}:`, error);
              // Return report with default values if fetch fails
              return {
                reportId: report.id,
                description: report.reason,
                createdAt: report.createdAt,
                song: {
                  _id: report.songId,
                  title: 'Unknown Song',
                  artist: 'Unknown Artist',
                  songImage: '/default-song.png'
                },
                reporter: {
                  _id: report.userId,
                  name: 'Unknown User',
                  email: 'No email provided',
                  avatarUrl: '/default-avatar.png'
                }
              };
            }
          })
        );

        setDetailedReports(detailedData);
      } catch (error) {
        console.error('Error fetching report details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, []);

  const handleDeleteSong = async (songId, reportId, songTitle) => {
    setConfirmDialog({
      isOpen: true,
      songId,
      reportId,
      songTitle
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const { songId, reportId } = confirmDialog;
      
      // Delete the song
      await axios.delete(
        `http://localhost:8080/api/songs/${songId}`,
        { withCredentials: true }
      );

      // Update UI
      setDetailedReports(prev => prev.filter(report => report.reportId !== reportId));
      
      // Close dialog
      setConfirmDialog({ isOpen: false, songId: null, reportId: null, songTitle: '' });
      
      // Show success message
      alert('Song has been removed successfully');
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Error occurred while removing the song');
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/report/${reportId}`,
        { withCredentials: true }
      );

      // Update UI by removing the deleted report
      setDetailedReports(prev => prev.filter(report => report.reportId !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error occurred while deleting the report');
    }
  };

  const handleAction = (reportId, action, song = null) => {
    if (action === 'approve' && song) {
      setConfirmDialog({
        isOpen: true,
        songId: song._id,
        reportId,
        songTitle: song.title
      });
      return;
    }
    onActionClick(reportId, action);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        <AnimatePresence mode="popLayout">
          {detailedReports.map((report) => {
            // Safely access nested properties
            const songTitle = report?.song?.title || 'Unknown Song';
            const songArtist = report?.song?.artist || 'Unknown Artist';
            const songImage = report?.song?.songImage || '/default-song.png';
            const reporterName = report?.reporter?.name || 'Anonymous User';
            const reporterEmail = report?.reporter?.email || 'No email provided';
            const reporterAvatar = report?.reporter?.avatarUrl || '/default-avatar.png';
            const reportDescription = report?.description || 'No description provided';
            const reportDate = report?.createdAt ? formatDate(report.createdAt) : 'Unknown date';
            const reportId = report?.reportId || 'unknown';

            return (
              <motion.div
                key={reportId}
                variants={item}
                layout
                className="bg-zinc-800/50 backdrop-blur-xl rounded-xl overflow-hidden hover:bg-zinc-700/30 transition-all"
              >
                {/* Report Card */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                        <IoFlagOutline size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Report #{reportId}</h3>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <IoCalendarOutline size={12} />
                          {reportDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteReport(reportId)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete Report"
                      >
                        <IoCloseCircleOutline size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction(reportId, 'approve', report.song)}
                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                        title="Take Action"
                      >
                        <IoCheckmarkCircleOutline size={20} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Song Info */}
                    <div 
                      className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-900/80 transition-colors"
                      onClick={() => onReportClick(report)}
                    >
                      <div className="relative group">
                        <img 
                          src={songImage}
                          alt={songTitle}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <IoMusicalNotesOutline size={20} className="text-white" />
                        </motion.div>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{songTitle}</h4>
                        <p className="text-gray-400 text-sm">{songArtist}</p>
                      </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-xl">
                      <div className="relative">
                        <img
                          src={reporterAvatar}
                          alt={reporterName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-900 rounded-full">
                          <IoPersonOutline size={12} className="text-orange-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{reporterName}</p>
                        <p className="text-gray-400 text-xs">{reporterEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4 p-3 bg-zinc-900/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <IoWarningOutline size={16} className="text-orange-500" />
                      <h4 className="text-white text-sm font-medium">Report Description</h4>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{reportDescription}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, songId: null, reportId: null, songTitle: '' })}
        onConfirm={handleConfirmDelete}
        songTitle={confirmDialog.songTitle}
      />
    </>
  );
};

export default ListReports; 