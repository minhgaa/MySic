import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  IoMusicalNotesOutline,
  IoPeopleOutline,
  IoAlbumsOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoHomeOutline
} from 'react-icons/io5';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalGenres: 0,
    pendingSongs: 0,
    approvedSongs: 0,
    rejectedSongs: 0,
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [songs, users, genres] = await Promise.all([
        axios.get('http://localhost:3000/api/songs', { withCredentials: true }),
        axios.get('http://localhost:3000/api/users', { withCredentials: true }),
        axios.get('http://localhost:3000/api/genres', { withCredentials: true })
      ]);

      const allSongs = songs.data;
      
      setStats({
        totalSongs: allSongs.length,
        totalUsers: users.data.length,
        totalGenres: genres.data.length,
        pendingSongs: allSongs.filter(song => song.status === 'pending').length,
        approvedSongs: allSongs.filter(song => song.status === 'approved').length,
        rejectedSongs: allSongs.filter(song => song.status === 'rejected').length,
        recentUploads: allSongs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statsCards = [
    {
      title: 'Total Songs',
      value: stats.totalSongs,
      icon: IoMusicalNotesOutline,
      color: 'bg-orange-500',
      trend: '+5% from last month'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: IoPeopleOutline,
      color: 'bg-blue-500',
      trend: '+12% from last month'
    },
    {
      title: 'Total Genres',
      value: stats.totalGenres,
      icon: IoAlbumsOutline,
      color: 'bg-purple-500',
      trend: '+2 new genres'
    }
  ];

  const songStatusCards = [
    {
      title: 'Pending Review',
      value: stats.pendingSongs,
      icon: IoTimeOutline,
      color: 'bg-yellow-500'
    },
    {
      title: 'Approved Songs',
      value: stats.approvedSongs,
      icon: IoCheckmarkCircleOutline,
      color: 'bg-green-500'
    },
    {
      title: 'Rejected Songs',
      value: stats.rejectedSongs,
      icon: IoCloseCircleOutline,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <IoHomeOutline className="text-orange-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <p className="text-gray-400">Overview of your music platform</p>
        </motion.div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                    <IoTrendingUpOutline />
                    <span>{card.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Song Status Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {songStatusCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">{card.title}</p>
                <div className={`p-2 rounded-lg ${card.color}/10`}>
                  <card.icon size={20} className={card.color.replace('bg-', 'text-')} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{card.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Uploads</h2>
          <div className="space-y-4">
            {stats.recentUploads.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 bg-zinc-700/30 rounded-lg hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={song.songImage}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Uploaded by</p>
                    <p className="text-white">{song.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <IoCalendarOutline />
                    <span>{formatDate(song.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
} 