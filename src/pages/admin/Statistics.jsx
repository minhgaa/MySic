import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { IoStatsChartOutline } from 'react-icons/io5';
import AdminLayout from '../../components/layouts/AdminLayout';

const COLORS = ['#F97316', '#FB923C', '#FD8A4B', '#FDBA74', '#FED7AA', '#FFEDD5'];

export default function Statistics() {
  const [stats, setStats] = useState({
    songsByDate: [],
    genreDistribution: [],
    userActivity: [],
    isLoading: true
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [songs, users] = await Promise.all([
        axios.get('http://localhost:8080/api/songs', { withCredentials: true }),
        axios.get('http://localhost:8080/api/users', { withCredentials: true })
      ]);

      // Process songs by date
      const songsByDate = processSongsByDate(songs.data);
      
      // Process genre distribution
      const genreDistribution = processGenreDistribution(songs.data);
      
      // Process user activity
      const userActivity = processUserActivity(songs.data);

      setStats({
        songsByDate,
        genreDistribution,
        userActivity,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const processSongsByDate = (songs) => {
    const dateMap = new Map();
    
    songs.forEach(song => {
      const date = new Date(song.createdAt).toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap, ([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const processGenreDistribution = (songs) => {
    const genreMap = new Map();
    
    songs.forEach(song => {
      const genreName = song.genre?.name || 'Uncategorized';
      genreMap.set(genreName, (genreMap.get(genreName) || 0) + 1);
    });

    return Array.from(genreMap, ([name, value]) => ({
      name,
      value
    }));
  };

  const processUserActivity = (songs) => {
    const userMap = new Map();
    
    songs.forEach(song => {
      const userName = song.user?.name || 'Unknown User';
      userMap.set(userName, (userMap.get(userName) || 0) + 1);
    });

    return Array.from(userMap, ([name, uploads]) => ({
      name,
      uploads
    })).sort((a, b) => b.uploads - a.uploads).slice(0, 5);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
          <p className="text-white">{label}</p>
          <p className="text-orange-500">
            {`${payload[0].value} songs`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (stats.isLoading) {
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
            <IoStatsChartOutline className="text-orange-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Statistics</h1>
          </div>
          <p className="text-gray-400">Detailed analytics and insights of your music platform</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Songs Uploaded Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Songs Uploaded Over Time</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.songsByDate}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#F97316" 
                    fillOpacity={1} 
                    fill="url(#colorUploads)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Genre Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Genre Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.genreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Users by Uploads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-800/50 backdrop-blur-xl rounded-xl p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Top Users by Uploads</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.userActivity}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip />
                  <Bar dataKey="uploads" fill="#4ECDC4">
                    {stats.userActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
} 