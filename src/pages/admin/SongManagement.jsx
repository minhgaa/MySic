import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  IoCheckmark, 
  IoClose, 
  IoTimeOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline, 
  IoPlayOutline, 
  IoCalendarOutline, 
  IoPersonOutline, 
  IoMusicalNotesOutline, 
  IoTrashOutline,
  IoFlagOutline,
  IoWarningOutline
} from 'react-icons/io5';
import AdminLayout from '../../components/layouts/AdminLayout';
import ListReports from '../../components/ListReports';

const tabItems = [
  { id: 'pending', label: 'Pending', icon: IoTimeOutline },
  { id: 'approved', label: 'Approved', icon: IoCheckmarkCircleOutline },
  { id: 'rejected', label: 'Rejected', icon: IoCloseCircleOutline },
  { id: 'reports', label: 'Reports', icon: IoFlagOutline },
];

export default function SongManagement() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedSong, setExpandedSong] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    console.log('Tab changed to:', activeTab);
    fetchSongs();
  }, [activeTab]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      console.log('Fetching songs with status:', activeTab);
      let apiUrl = 'http://localhost:8080/api/songs/by-status';
      
      if (activeTab === 'pending' || activeTab === 'rejected' || activeTab === 'approved') {
        apiUrl += `?status=${activeTab}`;
      } else if (activeTab === 'reports') {
        apiUrl = 'http://localhost:8080/api/report';
      }

      const response = await axios.get(apiUrl, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Songs response:', response.data);
      
      if (Array.isArray(response.data)) {
        // Log detailed song structure
        if (response.data.length > 0) {
          const sampleSong = response.data[0];
          console.log('Sample song structure:', {
            id: sampleSong._id,
            uploadedBy: sampleSong.uploadedBy,
            allFields: Object.keys(sampleSong),
            fullSong: sampleSong
          });

          // Group songs by uploadedBy
          const songsByUser = response.data.reduce((acc, song) => {
            const userId = song.uploadedBy?._id || song.uploadedBy;
            if (!acc[userId]) {
              acc[userId] = [];
            }
            acc[userId].push(song);
            return acc;
          }, {});

          console.log('Songs grouped by user:', songsByUser);
        }
        setSongs(response.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        setSongs([]);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} songs:`, error.response?.data || error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (songId, action) => {
    try {
      const song = songs.find(s => s._id === songId || s.id === songId);
      if (!song) {
        console.error('Song not found in local state:', {
          searchedId: songId,
          availableSongs: songs.map(s => ({ id: s.id, _id: s._id }))
        });
        return;
      }

      const actualId = song._id || song.id;
      console.log(`${action}ing song:`, actualId);
      
      const response = await axios.patch(
        `http://localhost:8080/api/songs/${actualId}/${action}`,
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setSongs(prev => prev.filter(s => (s._id || s.id) !== actualId));
        console.log(`Song ${action}d successfully`);
      }
    } catch (error) {
      console.error(`Error ${action}ing song:`, error.response?.data || error);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/reports/${reportId}/${action}`,
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setSongs(prev => prev.filter(s => s.reportId !== reportId));
        setSelectedReport(null);
        console.log(`Report ${action}d successfully`);
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error.response?.data || error);
    }
  };

  const handleDelete = async (songId) => {
    if (!window.confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting song:', songId);
      const response = await axios.delete(
        `http://localhost:8080/api/songs/${songId}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setSongs(prev => prev.filter(s => (s._id || s.id) !== songId));
        console.log('Song deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting song:', error.response?.data || error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const detailsVariants = {
    hidden: { 
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.2
        },
        opacity: {
          duration: 0.1
        }
      }
    },
    visible: { 
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3
        },
        opacity: {
          duration: 0.2,
          delay: 0.1
        }
      }
    }
  };

  const ReportDialog = ({ report, onClose }) => {
    if (!report) return null;

    return (
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
          className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <IoClose size={20} />
          </button>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <IoWarningOutline className="text-orange-500" />
              Report Details
            </h2>

            {/* Song Info */}
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6">
              <img 
                src={report.song.songImage || "/default-song.png"}
                alt={report.song.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-white font-medium">{report.song.title}</h3>
                <p className="text-gray-400 text-sm">{report.song.artist}</p>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">Reporter Information</h4>
              <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                <img
                  src={report.reporter.avatarUrl || '/default-avatar.png'}
                  alt={report.reporter.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white">{report.reporter.name}</p>
                  <p className="text-gray-400 text-sm">{report.reporter.email}</p>
                </div>
              </div>
            </div>

            {/* Report Description */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">Report Description</h4>
              <div className="p-4 bg-zinc-800/50 rounded-xl">
                <p className="text-gray-300">{report.description}</p>
              </div>
            </div>

            {/* Report Date */}
            <div className="flex items-center gap-2 text-gray-400 mb-6">
              <IoCalendarOutline size={18} />
              <span className="text-sm">Reported on: {formatDate(report.createdAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReportAction(report.reportId, 'reject')}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Reject Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReportAction(report.reportId, 'approve')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Take Action
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <IoMusicalNotesOutline className="text-orange-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Song Management</h1>
          </div>
          <p className="text-gray-400">Manage and moderate uploaded songs</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {songs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-400"
                >
                  No {activeTab} songs found
                </motion.div>
              ) : activeTab === 'reports' ? (
                <ListReports 
                  reports={songs}
                  onReportClick={setSelectedReport}
                  onActionClick={handleReportAction}
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4"
                  >
                    {songs.length === 0 ? (
                      <motion.div 
                        variants={item}
                        className="text-center py-12 text-gray-400"
                      >
                        No {activeTab} songs found
                      </motion.div>
                    ) : (
                      songs.map((song) => (
                        <motion.div
                          key={song._id}
                          variants={item}
                          layout
                          className="bg-zinc-800/50 backdrop-blur-xl rounded-xl overflow-hidden"
                        >
                          {/* Song Header */}
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700/30 transition-colors"
                            onClick={() => {
                              if (activeTab === 'reports') {
                                setSelectedReport(song);
                              } else {
                                setExpandedSong(expandedSong === (song._id || song.id) ? null : (song._id || song.id));
                              }
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative group">
                                <img
                                  src={song.songImage}
                                  alt={song.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button className="text-white hover:text-orange-500 transition-colors">
                                    <IoPlayOutline size={24} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">{song.title}</h3>
                                <p className="text-gray-400 text-sm">{song.artist}</p>
                                {activeTab === 'reports' && (
                                  <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                    <IoFlagOutline size={12} />
                                    Reported by {song.reporter?.name || 'Unknown'}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {activeTab !== 'reports' && (
                              <div className="flex items-center gap-2">
                                {activeTab === 'pending' ? (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const songId = song._id || song.id;
                                        console.log('Approve button clicked for song:', {
                                          songId,
                                          song
                                        });
                                        handleAction(songId, 'approve');
                                      }}
                                      className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                                    >
                                      <IoCheckmark size={20} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const songId = song._id || song.id;
                                        handleAction(songId, 'reject');
                                      }}
                                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                      <IoClose size={20} />
                                    </motion.button>
                                  </>
                                ) : activeTab === 'approved' && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const songId = song._id || song.id;
                                      handleDelete(songId);
                                    }}
                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Delete song"
                                  >
                                    <IoTrashOutline size={18} />
                                  </motion.button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Song Details */}
                          {activeTab !== 'reports' && (
                            <AnimatePresence>
                              {expandedSong === (song._id || song.id) && (
                                <motion.div
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  variants={detailsVariants}
                                  className="border-t border-zinc-700/50"
                                >
                                  <div className="p-6 space-y-4">
                                    {/* Song Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <IoMusicalNotesOutline size={18} />
                                          <span className="text-sm">Genre: {song.genre?.name || 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <IoCalendarOutline size={18} />
                                          <span className="text-sm">Uploaded: {typeof song.createdAt === 'string' ? formatDate(song.createdAt) : 'Unknown date'}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <IoPersonOutline size={18} />
                                          <span className="text-sm">Artist: {typeof song.artist === 'string' ? song.artist : 'Unknown artist'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <IoTimeOutline size={18} />
                                          <span className="text-sm">Status: {typeof song.status === 'string' ? song.status : 'Unknown status'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Audio Player */}
                                    <div className="bg-zinc-900/50 rounded-lg p-4">
                                      <audio 
                                        controls 
                                        className="w-full" 
                                        src={song.fileUrl}
                                      >
                                        Your browser does not support the audio element.
                                      </audio>
                                    </div>

                                    {/* Uploader Info */}
                                    <div className="bg-zinc-900/50 rounded-lg p-4">
                                      <h4 className="text-white font-semibold mb-2">Uploader Information</h4>
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={song.user?.avatarUrl || '/default-avatar.png'}
                                          alt={song.user?.name || 'Unknown'}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                          <p className="text-white">{song.user?.name || 'Unknown'}</p>
                                          <p className="text-gray-400 text-sm">{song.user?.email || 'No email provided'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Report Dialog */}
        <AnimatePresence>
          {selectedReport && (
            <ReportDialog
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
} 