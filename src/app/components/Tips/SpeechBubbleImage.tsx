import React from 'react';
import Grid from '@mui/material/Grid2';

interface Props {
    children: React.ReactNode;
    msg: string;
    open?: boolean
}

export const SpeechBubbleImage = ({ children, msg, open = true }: Props) => {
    return (
        <Grid container
            direction="row-reverse" sx={{
                justifyContent: "center",
                alignItems: "center", marginX: 'auto', maxWidth: 200, width: '100%', height: '100%', position: 'relative'
            }}>
            <Grid
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'auto',
                    position: 'relative'
                }}
            >
                <Grid
                    sx={{
                        textAlign: open ? 'left' : 'center',
                        position: 'absolute',
                        width: 'auto',
                        top: '-20px',
                        bgcolor: "var(--stone-50)",
                        borderRadius: "10px",
                        padding: "10px",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-19px', // 吹き出しの三角形を下側に配置する場合
                            left: '70%', // 中央に配置
                            transform: 'translateX(-50%)', // 真ん中に位置合わせ
                            borderWidth: '10px',
                            borderStyle: 'solid',
                            borderColor: 'var(--stone-50) transparent transparent transparent',
                        },
                    }}
                >
                    {msg}
                </Grid>
                {children}
            </Grid>
        </Grid>
    );
};
