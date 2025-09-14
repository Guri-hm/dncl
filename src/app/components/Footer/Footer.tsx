"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTheme } from "@mui/material/styles";

export default function Footer() {
    const theme = useTheme();
    return (
        <Box
            component="footer"
            sx={{
                py: 1,
                textAlign: "center",
                borderTop: 1,
                borderColor: "divider",
                bgcolor:
                    theme.palette.mode === "dark" ? "var(--slate-950)" : "background.paper",
            }}
        >
            <a
                href="https://github.com/Guri-hm/dncl"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                    color: "inherit",
                }}
            >
                <GitHubIcon sx={{ verticalAlign: "middle", color: "text.primary" }} />
                <span style={{ color: "text.primary" }}>GitHub: Guri-hm/dncl</span>
            </a>
            <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                &copy; {new Date().getFullYear()} Guri-hm
            </Typography>
        </Box>
    );
}