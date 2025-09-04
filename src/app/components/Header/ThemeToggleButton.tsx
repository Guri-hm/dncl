"use client"
import { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useThemeMode } from '@/app/hooks/ThemeProvider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { SxProps } from "@mui/material";

const themeOptions = [
    { value: "light", label: "ライト", icon: <LightModeIcon /> },
    { value: "dark", label: "ダーク", icon: <DarkModeIcon /> },
    { value: "system", label: "システム", icon: <SettingsBrightnessIcon /> },
];

export const ThemeToggleButton = ({ sx }: { sx?: SxProps }) => {
    const { mode, setMode } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (value: string) => {
        setMode(value as any);
        handleClose();
    };

    const current = themeOptions.find(opt => opt.value === mode);

    return (
        <>
            <IconButton
                onClick={handleClick}
                color="inherit"
                sx={{
                    color: "#fff",
                    ...sx,
                }}
            >
                {current?.icon}
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {themeOptions.map(opt => (
                    <MenuItem key={opt.value} selected={mode === opt.value} onClick={() => handleSelect(opt.value)}>
                        <ListItemIcon>{opt.icon}</ListItemIcon>
                        <ListItemText>{opt.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};