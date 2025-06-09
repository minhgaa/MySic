import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseView from '../components/BaseView';
import { useAuth } from '../hooks/authContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import axios from 'axios';
import { 
  IoPersonOutline, 
  IoMailOutline,
  IoMusicalNotesOutline,
  IoHeartOutline,
  IoTimeOutline,
  IoPencilOutline,
  IoCloudUploadOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoAlertCircleOutline,
  IoLogOutOutline,
  IoPlayOutline,
  IoPauseOutline
} from 'react-icons/io5';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (authUser) {
      setEditedUser({
        name: authUser.name || '',
        email: authUser.email || ''
      });
    }
  }, [authUser]);

  // Fetch uploaded songs
  useEffect(() => {
    const fetchUploadedSongs = async () => {
      if (!authUser?._id) return;
      
      try {
        setLoadingSongs(true);
        const response = await axiosInstance.get(`/api/songs/user/${authUser._id}`);
        setUploadedSongs(response.data);
      } catch (err) {
        console.error('Error fetching uploaded songs:', err);
        setError('Failed to load uploaded songs');
      } finally {
        setLoadingSongs(false);
      }
    };

    fetchUploadedSongs();
  }, [authUser?._id]);

  const handleSave = async () => {
    if (!authUser?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updates = {
        name: editedUser.name,
        email: editedUser.email
      };

      const response = await axiosInstance.put(`/api/users/${authUser._id}`, updates);

      setEditedUser({
        ...editedUser,
        ...response.data
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'mysic_images');
    formData.append('folder', 'mysic/avatars');

    console.log('Starting avatar upload to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type
    });

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dl2lnn4dc/auto/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: false,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );
      console.log('Avatar upload successful:', response.data);
      return response.data.secure_url;
    } catch (err) {
      console.error('Avatar upload error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      throw new Error(`Failed to upload avatar: ${err.response?.data?.error?.message || err.message}`);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !authUser?._id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Update user profile with new avatar URL
      const response = await axiosInstance.put(`/api/users/${authUser._id}`, {
        avatarUrl: imageUrl
      });

      // Update local state
      setEditedUser({
        ...editedUser,
        ...response.data
      });

      setUploadProgress(0);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.response?.data?.message || 'Failed to update avatar. Please try again.');
      // Reset preview on error
      setSelectedImage(null);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-2"
    >
      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
        <Icon size={20} />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </motion.div>
  );

  return (
    <BaseView>
      <div className="min-h-full bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-xl p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <IoPencilOutline />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setEditedUser({
                      name: authUser?.name || '',
                      email: authUser?.email || ''
                    });
                    setError(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  disabled={loading}
                >
                  <IoCloseOutline />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoCheckmarkOutline />
                  )}
                  Save Changes
                </motion.button>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              <IoLogOutOutline />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center gap-2"
          >
            <IoAlertCircleOutline />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-[300px,1fr] gap-8">
          {/* Left Column - Avatar and Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Avatar Section */}
            <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
              <div className="relative inline-block">
                <img 
                  src={selectedImage || authUser?.avatarUrl || "/default-avatar.png"}
                  alt="User Avatar"
                  className="w-40 h-40 rounded-full object-cover mx-auto mb-4"
                />
                {isEditing && (
                  <label className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
                    <IoCloudUploadOutline className="text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full max-w-[160px] mx-auto mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <h2 className="text-xl font-semibold text-white mb-1">{authUser?.name || 'User Name'}</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-500 text-white">
                {authUser?.role === 'admin' ? 'Admin' : 'Free User'}
              </span>
              <p className="text-gray-400 text-sm mt-4">
                Member since {new Date(authUser?.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={IoMusicalNotesOutline}
                label="Uploaded"
                value={`${uploadedSongs.length || 0} songs`}
              />
              <StatCard 
                icon={IoHeartOutline}
                label="Liked"
                value={`${authUser?.likedSongs || 0} songs`}
              />
              <StatCard 
                icon={IoTimeOutline}
                label="Listening Time"
                value={`${Math.floor((authUser?.listeningTime || 0) / 60)}h ${(authUser?.listeningTime || 0) % 60}m`}
              />
              <StatCard 
                icon={IoPersonOutline}
                label="Following"
                value={`${authUser?.following || 0} artists`}
              />
            </div>
          </motion.div>

          {/* Right Column - User Info and Songs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
              
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm flex items-center gap-2">
                    <IoPersonOutline />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-orange-500 focus:outline-none text-white"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-white">{authUser?.name || 'Not set'}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm flex items-center gap-2">
                    <IoMailOutline />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-orange-500 focus:outline-none text-white"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-white">{authUser?.email || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded Songs */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <IoMusicalNotesOutline />
                Your Uploaded Songs
              </h3>

              {loadingSongs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : uploadedSongs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <IoMusicalNotesOutline className="mx-auto text-4xl mb-2" />
                  <p>You haven't uploaded any songs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedSongs.map((song) => (
                    <motion.div
                      key={song._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 bg-zinc-700/30 p-4 rounded-lg hover:bg-zinc-700/50 transition-colors group"
                    >
                      <img 
                        src={song.songImage || "/default-song.png"} 
                        alt={song.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{song.title}</h4>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          song.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
                          song.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {song.status.charAt(0).toUpperCase() + song.status.slice(1)}
                        </span>
                        <button 
                          className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-500/20"
                          onClick={() => {/* Handle play */}}
                        >
                          <IoPlayOutline size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </BaseView>
  );
};

export default Profile; 