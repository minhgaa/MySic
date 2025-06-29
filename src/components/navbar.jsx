import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { RiHomeLine, RiUserLine } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { IoLogOutOutline } from "react-icons/io5";
import ListItemText from '@mui/material/ListItemText';
import { PiPlaylist } from "react-icons/pi";
import { Button, Typography } from '@mui/material';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/authContext';

export default function Navbar() {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { user } = useAuth();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const items = [
        { text: "Home", icon: <RiHomeLine />, link: "/" },
        { text: "Category", icon: <BiCategory />, link: "/category" },
        { text: "Artist", icon: <RiUserLine />, link: "/artist" },
        { text: "Playlist", icon: <PiPlaylist />, link: "/playlist" },
    ];

    useEffect(() => {
        const path = location.pathname;
        const index = items.findIndex(item => 
            path === item.link || 
            (path.startsWith('/playlist/') && item.link === '/playlist')
        );
        if (index !== -1) {
            setSelectedIndex(index);
        }
    }, [location.pathname]);

    const handleClick = (item, index) => {
        setSelectedIndex(index);
        navigate(item.link);
    };

    return (
        <div className="bg-[#191B20] p-2 w-full h-full rounded-xl flex flex-col justify-between">
            <Box className="pt-3 flex flex-col justify-center">
                <Button sx={{ pb: 0 }} onClick={() => navigate("/")}>
                    <img src={logo} alt="Logo" className="w-14 h-16" />
                </Button>

                <List className="space-y-0">
                    {items.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton
                                onClick={() => handleClick(item, index)}
                                sx={{
                                    bgcolor: selectedIndex === index ? "#333842" : "transparent",
                                    borderRadius: "12px",
                                    "&:hover": { bgcolor: "#2C313A" },
                                    margin: "4px 8px",
                                    padding: "8px 16px",
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
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

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