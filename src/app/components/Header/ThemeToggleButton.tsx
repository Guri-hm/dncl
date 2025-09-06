"use client"
import { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useThemeMode } from '@/app/hooks/ThemeProvider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { SxProps } from "@mui/material";

type ThemeMode = "light" | "dark" | "system";

const themeOptions = [
    { value: "light", label: "ライト", icon: <LightModeIcon /> },
    { value: "dark", label: "ダーク", icon: <DarkModeIcon /> },
    { value: "system", label: "システム", icon: <SettingsBrightnessIcon /> },
];

export const ThemeToggleButton = ({ sx }: { sx?: SxProps }) => {
    const { mode, setMode } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mounted, setMounted] = useState(false);

    // SSR対応: クライアントサイドでマウントされるまで待機
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (value: string) => {
        setMode(value as ThemeMode);
        handleClose();
    };

    // マウント前はシステムテーマのアイコンを固定表示（SSR時の一貫性のため）
    const current = mounted
        ? themeOptions.find(opt => opt.value === mode)
        : themeOptions.find(opt => opt.value === "system");

    return (
        <>
            <IconButton
                onClick={handleClick}
                color="inherit"
                sx={{
                    color: "#fff",
                    ...sx,
                }}
                // マウント前は無効化してメニューの表示を防ぐ
                disabled={!mounted}
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