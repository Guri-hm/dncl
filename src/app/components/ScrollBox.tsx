import { Box } from '@mui/material';
import { styled } from '@mui/system';

interface Props {
    children: React.ReactNode;
}

const StyledBox = styled(Box)({
    overflow: 'hidden', // 初期状態ではスクロールバーを非表示
    '&:hover': {
        overflow: 'auto', // ホバー時にスクロールバーを表示
    },
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: '#555',
    },
});

function ScrollBox({ children }: Props) {
    return (
        <StyledBox sx={{ wordBreak: 'break-all', height: '100%', p: 3 }}>
            {children}
        </StyledBox>
    );
}

export default ScrollBox; 