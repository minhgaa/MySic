import { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { RiHomeLine, RiUserLine } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { IoLogOutOutline, IoCloseOutline, IoImageOutline } from "react-icons/io5";
import ListItemText from '@mui/material/ListItemText';
import { PiPlaylist } from "react-icons/pi";
import Menu from '@mui/material/Menu';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import MenuItem from '@mui/material/MenuItem';
import { Button, ListItemAvatar, Typography, Avatar, Dialog, TextField } from '@mui/material';
import logo from '../assets/logo.png';

export default function Navbar() {
    const navigate = useNavigate(); 
    const location = useLocation();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);
    const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
    const [playlistData, setPlaylistData] = useState({
        name: '',
        description: '',
        coverImage: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const items = [
        { text: "Home", icon: <RiHomeLine />, link: "/" },
        { text: "Category", icon: <BiCategory />, link: "/category" },
        { text: "Artist", icon: <RiUserLine />, link: "/artist" },
        { text: "Playlist", icon: <PiPlaylist />, link: "/playlist/usuk" },
    ];

    const playlistItems = [
        { 
            id: "usuk",
            text: "UsUk", 
            img: "src/assets/usuk.jpg",
            description: "Best US-UK hits of all time",
            songCount: 45,
            totalDuration: "2h 35m"
        },
        { 
            id: "vpop",
            text: "Vpop", 
            img: "src/assets/vpop.jpg",
            description: "Top Vietnamese pop songs",
            songCount: 32,
            totalDuration: "1h 48m"
        },
        { 
            id: "kpop",
            text: "Kpop", 
            img: "src/assets/kpop.jpg",
            description: "Latest K-pop hits",
            songCount: 38,
            totalDuration: "2h 10m"
        },
    ];

    useEffect(() => {
        const index = items.findIndex(item => {
            if (item.link === location.pathname) return true;
            if (location.pathname.startsWith('/playlist/') && item.text === 'Playlist') return true;
            return false;
        });
        if (index !== -1) {
            setSelectedIndex(index);
            if (!(location.pathname.startsWith('/playlist/') && index === 3)) {
                setAnchorEl(null);
            }
        }
    }, [location.pathname]);

    const handleMenuClick = (event, index) => {
        setSelectedIndex(index);
        if (index === 3) {
            if (location.pathname.startsWith('/playlist/')) {
                setAnchorEl(anchorEl ? null : event.currentTarget);
            } else {
                setAnchorEl(event.currentTarget);
                navigate(items[index].link);
            }
        } else {
            setAnchorEl(null);
            navigate(items[index].link);
        }
    };

    const handlePlaylistClick = (playlist) => {
        navigate(`/playlist/${playlist.id}`, { 
            state: { 
                name: playlist.text,
                description: playlist.description,
                coverUrl: playlist.img,
                songCount: playlist.songCount,
                totalDuration: playlist.totalDuration
            } 
        });
        setAnchorEl(null);
    };

    const handleCreatePlaylist = async () => {
        if (!playlistData.name) return;
        
        try {
            setLoading(true);
            // TODO: API call to create playlist
            console.log('Creating playlist:', playlistData);
            
            // Reset form and close dialog
            setPlaylistData({
                name: '',
                description: '',
                coverImage: null
            });
            setImagePreview(null);
            setOpenCreatePlaylist(false);
        } catch (error) {
            console.error('Error creating playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPlaylistData(prev => ({ ...prev, coverImage: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-[#191B20] p-2 w-full h-full rounded-xl flex flex-col justify-between">
            <Box className="pt-3 flex flex-col justify-center">
                <Button sx={{ pb: 0 }} onClick={() => navigate("/")}>
                    <img src={logo} alt="Logo" className="w-14 h-16" />
                </Button>

                <List className="space-y-0">
                    {items.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemButton
                                onClick={(e) => handleMenuClick(e, index)}
                                sx={{
                                    bgcolor: selectedIndex === index ? "#333842" : "transparent",
                                    borderRadius: "12px",
                                    "&:hover": { bgcolor: "#2C313A" },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: selectedIndex === index ? "white" : "gray",
                                        fontSize: "22px",
                                        minWidth: "40px",
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography sx={{
                                            color: selectedIndex === index ? "white" : "gray",
                                            fontSize: "14px",
                                            fontFamily: "Montserrat",
                                        }}>
                                            {item.text}
                                        </Typography>
                                    }
                                />
                                {index === 3 &&
                                    (<ListItemIcon sx={{
                                        color: selectedIndex === index ? "white" : "gray",
                                        fontSize: "15px",
                                        minWidth: "40px",
                                    }}>
                                        {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                    </ListItemIcon>)}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "#2C313A",
                        borderRadius: "12px",
                        marginTop: "8px",
                        minWidth: "200px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    },
                    "& .MuiList-root": {
                        padding: "8px",
                    },
                }}
                MenuListProps={{
                    sx: {
                        padding: 0,
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        setOpenCreatePlaylist(true);
                        setAnchorEl(null);
                    }}
                    sx={{ 
                        padding: "8px 16px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        backgroundColor: "rgba(234, 88, 12, 0.2)",
                        "&:hover": { 
                            backgroundColor: "rgba(234, 88, 12, 0.3)" 
                        }
                    }}
                >
                    <ListItemIcon>
                        <PiPlaylist className="text-orange-500" size={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography sx={{ 
                                fontSize: "14px", 
                                color: "white", 
                                fontFamily: "Montserrat",
                                fontWeight: "500"
                            }}>
                                Create New Playlist
                            </Typography>
                        }
                    />
                </MenuItem>

                <div className="px-4 py-2 text-gray-400 text-xs font-medium">
                    Your Playlists
                </div>

                {playlistItems.map((item, index) => (
                    <MenuItem 
                        key={index} 
                        onClick={() => handlePlaylistClick(item)}
                        sx={{ 
                            padding: "8px 16px",
                            borderRadius: "8px",
                            marginBottom: "4px",
                            "&:hover": { 
                                backgroundColor: "rgba(255, 255, 255, 0.1)" 
                            },
                            "&:last-child": {
                                marginBottom: 0
                            }
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar 
                                src={item.img} 
                                variant="rounded"
                                sx={{ 
                                    width: 40, 
                                    height: 40,
                                    borderRadius: "8px"
                                }} 
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography sx={{ 
                                    fontSize: "14px", 
                                    color: "white", 
                                    fontFamily: "Montserrat",
                                    fontWeight: "500"
                                }}>
                                    {item.text}
                                </Typography>
                            }
                            secondary={
                                <Typography sx={{ 
                                    fontSize: "12px", 
                                    color: "gray",
                                    fontFamily: "Montserrat" 
                                }}>
                                    {item.songCount} songs
                                </Typography>
                            }
                        />
                    </MenuItem>
                ))}
            </Menu>

            {/* Create Playlist Dialog */}
            <Dialog 
                open={openCreatePlaylist} 
                onClose={() => {
                    setOpenCreatePlaylist(false);
                    setPlaylistData({ name: '', description: '', coverImage: null });
                    setImagePreview(null);
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#191B20',
                        borderRadius: '16px',
                        minWidth: '400px'
                    }
                }}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Typography sx={{ 
                            fontSize: "20px", 
                            color: "white", 
                            fontFamily: "Montserrat",
                            fontWeight: "600"
                        }}>
                            Create New Playlist
                        </Typography>
                        <button 
                            onClick={() => setOpenCreatePlaylist(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <IoCloseOutline size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Cover Image Upload */}
                        <div className="relative">
                            <div className={`w-full h-48 rounded-xl border-2 border-dashed ${imagePreview ? 'border-transparent' : 'border-gray-600'} overflow-hidden`}>
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt="Playlist Cover" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <IoImageOutline size={40} />
                                        <span className="mt-2 text-sm">Click to upload cover image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Name Input */}
                        <TextField
                            fullWidth
                            label="Playlist Name"
                            value={playlistData.name}
                            onChange={(e) => setPlaylistData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ea580c',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'gray',
                                    '&.Mui-focused': {
                                        color: '#ea580c',
                                    },
                                },
                            }}
                        />

                        {/* Description Input */}
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description (Optional)"
                            value={playlistData.description}
                            onChange={(e) => setPlaylistData(prev => ({ ...prev, description: e.target.value }))}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ea580c',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'gray',
                                    '&.Mui-focused': {
                                        color: '#ea580c',
                                    },
                                },
                            }}
                        />

                        {/* Create Button */}
                        <button
                            onClick={handleCreatePlaylist}
                            disabled={!playlistData.name || loading}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                !playlistData.name || loading
                                ? 'bg-orange-600/50 text-white/50 cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Create Playlist'
                            )}
                        </button>
                    </div>
                </div>
            </Dialog>

            <Button
                sx={{
                    textTransform: "none",
                    color: "gray",
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                        color: "white",
                    },
                }}
                onClick={() => navigate("/login")}
            >
                <IoLogOutOutline className="text-lg mr-2" />
                <Typography
                    sx={{
                        fontSize: "14px",
                        fontFamily: "Montserrat",
                    }}
                >
                    Logout
                </Typography>
            </Button>
        </div>
    );
}