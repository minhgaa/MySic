import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCloudUploadOutline } from 'react-icons/io5';
import axios from 'axios';

const UploadSong = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        genreId: '',
        lyrics: ''
    });
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ image: 0, audio: 0 });
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const [loadingGenres, setLoadingGenres] = useState(true);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/genres', {
                    withCredentials: true
                });
                setGenres(response.data);
            } catch (err) {
                console.error('Error fetching genres:', err);
                setError('Failed to load genres');
            } finally {
                setLoadingGenres(false);
            }
        };

        fetchGenres();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudio(file);
        }
    };

    const uploadToCloudinary = async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        const preset = type === 'image' ? 'mysic_images' : 'mysic_songs';
        formData.append('upload_preset', preset);

        // Use 'auto' resource type to let Cloudinary detect the file type
        const resourceType = 'auto';

        console.log('Starting upload to Cloudinary:', {
            type,
            fileName: file.name,
            fileSize: file.size,
            preset,
            contentType: file.type,
            resourceType
        });

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dl2lnn4dc/${resourceType}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: false, // Add this to prevent CORS issues
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(prev => ({
                            ...prev,
                            [type]: percentCompleted
                        }));
                    }
                }
            );
            console.log('Upload successful:', response.data);
            return response.data.secure_url;
        } catch (err) {
            console.error('Detailed upload error:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
                type: type,
                fileName: file.name,
                fileType: file.type
            });
            throw new Error(`Failed to upload ${type}: ${err.response?.data?.error?.message || err.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!image || !audio) {
                throw new Error('Please select both image and audio files');
            }

            if (!formData.title || !formData.artist || !formData.genreId) {
                throw new Error('Please fill in all required fields: title, artist, and genre');
            }

            // Upload image and audio to Cloudinary
            const [imageUrl, audioUrl] = await Promise.all([
                uploadToCloudinary(image, 'image'),
                uploadToCloudinary(audio, 'audio')
            ]);

            // Prepare song data according to backend requirements
            const songData = {
                title: formData.title,
                artist: formData.artist,
                genreId: formData.genreId,
                lyrics: formData.lyrics || '',
                fileUrl: audioUrl,
                songImage: imageUrl,
                status: "pending"
            };

            console.log('Sending song data to backend:', songData);

            // Send song data to backend
            const response = await axios.post('http://localhost:3000/api/songs', songData, {
                withCredentials: true
            });

            console.log('Backend response:', response.data);
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            setError(err.response?.data?.error || err.message || 'Failed to upload song');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md my-8">
                <h2 className="text-2xl font-bold text-white mb-6">Upload New Song</h2>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Cover Image</label>
                        <div className="relative h-48 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <IoCloudUploadOutline size={40} />
                                    <span className="mt-2">Click to upload image</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        {progress.image > 0 && progress.image < 100 && (
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-orange-600 h-2.5 rounded-full"
                                    style={{ width: `${progress.image}%` }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Audio Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Audio File</label>
                        <div className="relative h-20 border-2 border-dashed border-gray-600 rounded-lg">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                {audio ? (
                                    <span className="text-orange-500">{audio.name}</span>
                                ) : (
                                    <>
                                        <IoCloudUploadOutline size={24} />
                                        <span className="mt-1">Click to upload audio</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        {progress.audio > 0 && progress.audio < 100 && (
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-orange-600 h-2.5 rounded-full"
                                    style={{ width: `${progress.audio}%` }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Song Details */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Artist</label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Genre</label>
                            <select
                                name="genreId"
                                value={formData.genreId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white"
                                required
                                disabled={loadingGenres}
                            >
                                <option value="">Select genre</option>
                                {genres.map((genre) => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                            {loadingGenres && (
                                <div className="mt-2 text-sm text-gray-400">Loading genres...</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Lyrics (Optional)</label>
                            <textarea
                                name="lyrics"
                                value={formData.lyrics}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white"
                                rows="4"
                                placeholder="Enter song lyrics..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || loadingGenres}
                            className={`flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg 
                                ${(loading || loadingGenres) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'} 
                                transition-colors`}
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default UploadSong; 