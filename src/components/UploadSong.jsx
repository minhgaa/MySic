import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUploadOutline, IoImageOutline, IoMusicalNotesOutline, IoChevronDownOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { IoMdMusicalNote, IoMdHeadset, IoMdMicrophone, IoMdPulse, IoMdStar } from 'react-icons/io';
import axios from 'axios';
import Toast from './Toast';

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
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({
        message: '',
        type: 'success'
    });
    const [dragActive, setDragActive] = useState({ image: false, audio: false });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    const uploadZoneVariants = {
        idle: { scale: 1 },
        hover: { scale: 1.02 },
        drag: { scale: 1.05, borderColor: "#f97316" }
    };

    const genreIcons = {
        "Pop": IoMdMusicalNote,
        "Rock": IoMdHeadset,
        "Hip Hop": IoMdMicrophone,
        "EDM": IoMdPulse,
        "Jazz": IoMdStar,
        // Add more genre icons as needed
    };

    const CustomSelect = ({ value, onChange, options, isLoading, disabled }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedOption = options.find(opt => opt.id === value);

        return (
            <div className="relative">
                <motion.button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled || isLoading}
                    className={`w-full px-4 py-3 rounded-lg bg-zinc-800 text-left flex items-center justify-between
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}
                        transition-colors duration-200`}
                    whileHover={!disabled && { scale: 1.01 }}
                    whileTap={!disabled && { scale: 0.99 }}
                >
                    <span className={selectedOption ? "text-white" : "text-gray-400"}>
                        {selectedOption ? selectedOption.name : "Select genre"}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <IoChevronDownOutline className="text-gray-400" size={20} />
                    </motion.div>
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 py-2 bg-zinc-800 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                        >
                            {options.map((option) => {
                                const isSelected = option.id === value;

                                return (
                                    <motion.button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            onChange({ target: { name: 'genreId', value: option.id } });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 flex items-center justify-between text-left
                                            ${isSelected ? 'bg-orange-500/20 text-orange-500' : 'text-white hover:bg-zinc-700'}
                                            transition-colors duration-200`}
                                        whileHover={{ x: 4 }}
                                    >
                                        <span>{option.name}</span>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <IoCheckmarkOutline size={18} />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const LoadingGenreSelect = () => (
        <div className="space-y-2">
            <motion.div
                className="h-[46px] bg-zinc-800 rounded-lg overflow-hidden"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.8
                }}
            >
                <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-shimmer" 
                        style={{ backgroundSize: '200% 100%' }}
                    />
                </div>
            </motion.div>
        </div>
    );

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/genres', {
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

    const showNotification = (message, type = 'success') => {
        setToastConfig({ message, type });
        setShowToast(true);
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

            // Prepare song data as a regular object
            const songData = {
                title: formData.title,
                artist: formData.artist,
                genreId: formData.genreId,
                lyrics: formData.lyrics || '',
                fileUrl: audioUrl,
                songImage: imageUrl,
                status: 'pending'
            };

            console.log('Sending song data to backend:', songData);

            // Send song data to backend as JSON
            const response = await axios.post('http://localhost:8080/api/songs', songData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Backend response:', response.data);
            showNotification('Song uploaded successfully! It will be reviewed by our team.');
            setTimeout(() => {
                onSuccess?.();
                onClose?.();
            }, 2000);
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to upload song';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnter = (type, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: true }));
    };

    const handleDragLeave = (type, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));
    };

    const handleDrop = (type, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));
        
        const file = e.dataTransfer.files[0];
        if (file) {
            if (type === 'image') {
                handleImageChange({ target: { files: [file] } });
            } else {
                handleAudioChange({ target: { files: [file] } });
            }
        }
    };

    return (
        <>
            <AnimatePresence>
                {showToast && (
                    <Toast
                        message={toastConfig.message}
                        type={toastConfig.type}
                        onClose={() => setShowToast(false)}
                        duration={5000}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
                onClick={(e) => e.target === e.currentTarget && onClose?.()}
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="bg-zinc-900 rounded-xl p-6 w-full max-w-md my-8 shadow-2xl"
                >
                    <motion.h2 
                        variants={itemVariants}
                        className="text-2xl font-bold text-white mb-6"
                    >
                        Upload New Song
                    </motion.h2>

                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                        {/* Image Upload */}
                        <motion.div 
                            variants={itemVariants}
                            className="space-y-2"
                        >
                            <label className="block text-sm font-medium text-gray-300">Cover Image</label>
                            <motion.div
                                variants={uploadZoneVariants}
                                initial="idle"
                                animate={dragActive.image ? "drag" : "idle"}
                                whileHover="hover"
                                className="relative h-48 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden"
                                onDragEnter={(e) => handleDragEnter('image', e)}
                                onDragLeave={(e) => handleDragLeave('image', e)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop('image', e)}
                            >
                                {imagePreview ? (
                                    <motion.img
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <motion.div
                                            animate={{ 
                                                y: [0, -5, 0],
                                                transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }
                                            }}
                                        >
                                            <IoImageOutline size={40} />
                                        </motion.div>
                                        <span className="mt-2">Drop image here or click to upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </motion.div>
                            {progress.image > 0 && progress.image < 100 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative h-2 bg-gray-700 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.image}%` }}
                                        className="h-full bg-orange-600 rounded-full"
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Audio Upload */}
                        <motion.div 
                            variants={itemVariants}
                            className="space-y-2"
                        >
                            <label className="block text-sm font-medium text-gray-300">Audio File</label>
                            <motion.div
                                variants={uploadZoneVariants}
                                initial="idle"
                                animate={dragActive.audio ? "drag" : "idle"}
                                whileHover="hover"
                                className="relative h-20 border-2 border-dashed border-gray-600 rounded-lg"
                                onDragEnter={(e) => handleDragEnter('audio', e)}
                                onDragLeave={(e) => handleDragLeave('audio', e)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop('audio', e)}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    {audio ? (
                                        <motion.span 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-orange-500"
                                        >
                                            {audio.name}
                                        </motion.span>
                                    ) : (
                                        <>
                                            <motion.div
                                                animate={{ 
                                                    rotate: [0, 360],
                                                    transition: {
                                                        duration: 4,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }
                                                }}
                                            >
                                                <IoMusicalNotesOutline size={24} />
                                            </motion.div>
                                            <span className="mt-1">Drop audio file here or click to upload</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </motion.div>
                            {progress.audio > 0 && progress.audio < 100 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative h-2 bg-gray-700 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.audio}%` }}
                                        className="h-full bg-orange-600 rounded-full"
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Song Details */}
                        <motion.div 
                            variants={itemVariants}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Title</label>
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300">Artist</label>
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="text"
                                    name="artist"
                                    value={formData.artist}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                                {loadingGenres ? (
                                    <LoadingGenreSelect />
                                ) : (
                                    <CustomSelect
                                        value={formData.genreId}
                                        onChange={handleInputChange}
                                        options={genres}
                                        isLoading={loadingGenres}
                                        disabled={loadingGenres}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300">Lyrics (Optional)</label>
                                <motion.textarea
                                    whileFocus={{ scale: 1.01 }}
                                    name="lyrics"
                                    value={formData.lyrics}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md bg-zinc-800 border-transparent focus:border-orange-500 focus:ring-0 text-white transition-all duration-200"
                                    rows="4"
                                    placeholder="Enter song lyrics..."
                                />
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.div 
                            variants={itemVariants}
                            className="flex gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || loadingGenres}
                                className={`flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg 
                                    ${(loading || loadingGenres) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'} 
                                    transition-colors`}
                            >
                                {loading ? (
                                    <motion.div 
                                        className="flex items-center justify-center gap-2"
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Uploading...</span>
                                    </motion.div>
                                ) : (
                                    'Upload'
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
};

export default UploadSong; 