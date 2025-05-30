import { useState,useEffect } from 'react';
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
import Menu from '@mui/material/Menu';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import MenuItem from '@mui/material/MenuItem';
import { Button, ListItemAvatar, Typography, Avatar } from '@mui/material';

export default function Navbar() {
    const navigate = useNavigate(); 
    const location = useLocation();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);

    const items = [
        { text: "Home", icon: <RiHomeLine />, link: "/" },
        { text: "Category", icon: <BiCategory />, link: "/category" },
        { text: "Artist", icon: <RiUserLine />, link: "/artist" },
        { text: "Playlist", icon: <PiPlaylist /> },
    ];

    const playlistItems = [
        { text: "UsUk", img: "src/assets/usuk.jpg" },
        { text: "Vpop", img: "src/assets/vpop.jpg" },
        { text: "Kpop", img: "src/assets/kpop.jpg" },
    ];

    useEffect(() => {
        const index = items.findIndex(item => item.link === location.pathname);
        if (index !== -1) {
            setSelectedIndex(index);
            setAnchorEl(null);
        } else if (location.pathname.startsWith("/playlist")) {
            setSelectedIndex(3);
            setAnchorEl(null);
        }
    }, [location.pathname, items]); 

    const handleMenuClick = (event, index) => {
        setSelectedIndex(index);
        if (index === 3) {
            setAnchorEl(event.currentTarget);
        } else {
            setAnchorEl(null);
            if (items[index].link) {
                navigate(items[index].link);
            }
        }
    };

    return (
        <div className="bg-[#191B20] p-2 w-full h-full rounded-xl flex flex-col justify-between">
            <Box className="pt-3 flex flex-col justify-center">
                <Button sx={{ pb: 0 }} onClick={() => navigate("/")}>
                    <img src="src/assets/logo.png" className="w-14 h-16" />
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
                        backgroundColor: "transparent",
                        boxShadow: "none",
                    },
                }}
            >
                {playlistItems.map((item, index) => (
                    <MenuItem key={index} sx={{ display: "flex", alignItems: "center" }}>
                        <ListItemAvatar>
                            <Avatar src={item.img} sx={{ width: 26, height: 26 }} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography sx={{ fontSize: "14px", color: "white", fontFamily: "Montserrat" }}>
                                    {item.text}
                                </Typography>
                            }
                        />
                    </MenuItem>
                ))}
            </Menu>

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