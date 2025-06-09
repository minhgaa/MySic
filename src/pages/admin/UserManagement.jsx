import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoCalendarOutline, 
  IoMusicalNotesOutline,
  IoTrashOutline,
  IoSearchOutline,
  IoWarningOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/users', {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/users/${userId}`, {
        withCredentials: true
      });
      setUsers(prev => prev.filter(user => user._id !== userId));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
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
            <IoPeopleOutline className="text-orange-500" size={32} />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-gray-400">Manage and monitor user accounts</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 focus:border-orange-500 focus:outline-none text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* User List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {filteredUsers.length === 0 ? (
                <motion.div 
                  variants={item}
                  className="text-center py-12 text-gray-400"
                >
                  No users found
                </motion.div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    variants={item}
                    layout
                    className="bg-zinc-800/50 backdrop-blur-xl rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={user.avatarUrl || '/default-avatar.png'}
                            alt={user.username}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          {user.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 bg-orange-500 text-xs text-white px-2 py-0.5 rounded-full">
                              Admin
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{user.username}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <IoCalendarOutline />
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IoMusicalNotesOutline />
                              <span>{user.uploadedSongs || 0} songs uploaded</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {user.role !== 'admin' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <IoTrashOutline size={20} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                    <IoWarningOutline size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Delete User</h3>
                    <p className="text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete the user "{selectedUser.username}"? 
                  All their uploaded songs and data will be permanently removed.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
} 