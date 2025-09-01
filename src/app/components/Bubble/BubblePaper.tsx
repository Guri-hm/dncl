import { Paper, Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import './BubblePaper.css';
import { useNavigation } from '@/app/hooks/useNavigation';


interface BubblePaperProps {
    children: React.ReactNode;
    href: string;
}

export default function BubblePaper({ children, href }: BubblePaperProps) {

    const { navigateTo } = useNavigation();
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsClicked(true);
        navigateTo(href);
    };

    return (
        <Paper
            className="bubble"
            onClick={handleClick}
            style={{ position: 'relative' }}
        >
            {isClicked && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            <Box sx={{ opacity: isClicked ? 0.5 : 1 }}>
                {children}
                <span className="arrow"></span>
            </Box>
        </Paper>
    );
}