import { Paper, Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigation } from '@/app/hooks/useNavigation';
import { styled } from '@mui/material/styles';

interface BubblePaperProps {
    children: React.ReactNode;
    href: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    borderRadius: 15,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    height: '100%',
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: theme.palette.mode === 'dark' ? 'var(--slate-950)' : undefined,
    // ダーク時のボーダーは theme で判定（CSS変数も利用）
    border: theme.palette.mode === 'dark' ? `1px solid var(--slate-700)` : 'none',
    // arrow のスタイル（子セレクタ）
    '& .arrow': {
        display: 'none',
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: -30,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '15px 15px 0',
        borderColor: theme.palette.mode === 'dark'
            ? 'var(--stone-50) transparent transparent transparent'
            : 'var(--darkgray) transparent transparent transparent'
    },
    '&:hover .arrow': {
        display: 'block'
    }
}));

export default function BubblePaper({ children, href }: BubblePaperProps) {

    const { navigateTo } = useNavigation();
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsClicked(true);
        navigateTo(href);
    };

    return (
        <StyledPaper
            onClick={handleClick}
            sx={{
                position: 'relative',
            }}
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
        </StyledPaper>
    );
}