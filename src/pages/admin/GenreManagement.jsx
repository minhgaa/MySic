import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  IoListOutline,
  IoAddOutline,
  IoTrashOutline,
  IoSearchOutline,
  IoWarningOutline,
  IoPencilOutline,
  IoCloseOutline,
  IoSaveOutline,
  IoMusicalNotesOutline
} from 'react-icons/io5';
import AdminLayout from '../../components/layouts/AdminLayout';

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [newGenreName, setNewGenreName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      // Fetch both genres and songs
      const [genresResponse, songsResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/genres', {
          withCredentials: true,
          params: {
            search: searchTerm
          }
        }),
        axios.get('http://localhost:8080/api/songs', {
        withCredentials: true
        })
      ]);
      
      // Count songs for each genre
      const songCounts = songsResponse.data.reduce((acc, song) => {
        const genreId = song.genreId;
        if (genreId) {
          acc[genreId] = (acc[genreId] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Add song count to each genre
      const genresWithSongCount = genresResponse.data
        .filter(genre => genre && genre.id && genre.name) // Lọc ra các genre hợp lệ
        .map(genre => ({
        ...genre,
          songCount: songCounts[genre.id] || 0
      }));
      
      setGenres(genresWithSongCount);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError('Failed to load genres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [searchTerm]);

  const handleAddGenre = async () => {
    if (!newGenreName.trim()) {
      setError('Genre name cannot be empty');
      return;
    }

    const isDuplicate = genres.some(
      genre => genre.name.toLowerCase() === newGenreName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError('A genre with this name already exists');
      return;
    }

    try {
      console.log('Creating new genre:', newGenreName.trim());
      const response = await axios.post('http://localhost:8080/api/genres', 
        JSON.stringify({
        name: newGenreName.trim()
        }), 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response from server:', response.data);
      
      // Fetch lại danh sách genre sau khi thêm mới
      await fetchGenres();
      
      setNewGenreName('');
      setShowAddModal(false);
      setError('');
    } catch (error) {
      console.error('Error adding genre:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to add genre';
      // Clean up the Prisma error message to make it more user-friendly
      const cleanErrorMessage = errorMessage.includes('Unique constraint')
        ? 'A genre with this name already exists'
        : errorMessage.includes('prisma')
          ? 'There was an error adding the genre'
          : errorMessage;
      setError(cleanErrorMessage);
    }
  };

  const handleUpdateGenre = async () => {
    if (!newGenreName.trim()) {
      setError('Genre name cannot be empty');
      return;
    }

    const isDuplicate = genres.some(
      genre => 
        genre.id !== selectedGenre.id && 
        genre.name.toLowerCase() === newGenreName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError('A genre with this name already exists');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/genres/${selectedGenre.id}`, {
        name: newGenreName.trim()
      }, {
        withCredentials: true
      });

      // Fetch lại danh sách genre sau khi cập nhật
      await fetchGenres();
      
      setShowEditModal(false);
      setSelectedGenre(null);
      setNewGenreName('');
      setError('');
    } catch (error) {
      console.error('Error updating genre:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update genre';
      // Clean up the Prisma error message
      const cleanErrorMessage = errorMessage.includes('Unique constraint')
        ? 'A genre with this name already exists'
        : errorMessage.includes('prisma')
          ? 'There was an error updating the genre'
          : errorMessage;
      setError(cleanErrorMessage);
    }
  };

  const handleDeleteGenre = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/genres/${selectedGenre.id}`, {
        withCredentials: true
      });
      
      // Fetch lại danh sách genre sau khi xóa
      await fetchGenres();
      
      setShowDeleteConfirm(false);
      setSelectedGenre(null);
      setError('');
    } catch (error) {
      console.error('Error deleting genre:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete genre';
      // Clean up the Prisma error message
      const cleanErrorMessage = errorMessage.includes('prisma')
        ? 'There was an error deleting the genre. It might be in use by some songs.'
        : errorMessage;
      setError(cleanErrorMessage);
    }
  };

  const handleEditClick = (genre) => {
    setSelectedGenre(genre);
    setNewGenreName(genre.name);
    setShowEditModal(true);
  };

  const filteredGenres = genres.filter(genre =>
    genre && genre.name && genre.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <IoListOutline className="text-orange-500" size={32} />
              <h1 className="text-3xl font-bold text-white">Genre Management</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <IoAddOutline size={20} />
              Add Genre
            </motion.button>
          </div>
          <p className="text-gray-400">Manage music genres and categories</p>
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
              placeholder="Search genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 focus:border-orange-500 focus:outline-none text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500"
          >
            {error}
          </motion.div>
        )}

        {/* Genre List */}
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
              {filteredGenres.length === 0 ? (
                <motion.div 
                  variants={item}
                  className="text-center py-12 text-gray-400"
                >
                  No genres found
                </motion.div>
              ) : (
                filteredGenres.map((genre) => (
                  genre && genre.id && genre.name ? (
                  <motion.div
                      key={genre.id}
                    variants={item}
                    layout
                    className="bg-zinc-800/50 backdrop-blur-xl rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                              <IoListOutline size={20} />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{genre.name}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                <IoMusicalNotesOutline size={16} />
                                <span>{genre.songCount || 0} songs</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(genre)}
                          className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit genre"
                        >
                            <IoPencilOutline size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedGenre(genre);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete genre"
                        >
                          <IoTrashOutline size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                  ) : null
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Add Genre Modal */}
        <AnimatePresence>
          {showAddModal && (
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
                <h3 className="text-xl font-semibold text-white mb-4">Add New Genre</h3>
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="Enter genre name"
                  className="w-full px-4 py-2 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-orange-500 focus:outline-none text-white mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewGenreName('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGenre}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <IoSaveOutline size={20} />
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Genre Modal */}
        <AnimatePresence>
          {showEditModal && selectedGenre && (
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
                <h3 className="text-xl font-semibold text-white mb-4">Edit Genre</h3>
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="Enter genre name"
                  className="w-full px-4 py-2 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-orange-500 focus:outline-none text-white mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGenre(null);
                      setNewGenreName('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateGenre}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <IoSaveOutline size={20} />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && selectedGenre && (
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
                    <h3 className="text-xl font-semibold text-white">Delete Genre</h3>
                    <p className="text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete the genre "{selectedGenre.name}"?
                  This will affect all songs associated with this genre.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedGenre(null);
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteGenre(selectedGenre.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Genre
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default GenreManagement; 