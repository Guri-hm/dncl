import React from 'react';
import Grid from '@mui/material/Grid2';
import { Typography } from '@mui/material';

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
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}
            >
                <Grid
                    sx={{
                        textAlign: open ? 'left' : 'center',
                        position: 'absolute',
                        width: 'auto',
                        top: '-30px',
                        bgcolor: "white",
                        color: 'var(--foreground)',
                        borderRadius: "10px",
                        padding: "10px",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-22px',                // 色三角形より少し下に配置して影らしくする
                            left: '70%',
                            transform: 'translateX(-50%)',
                            borderWidth: '12px',            // 影は少し大きめ
                            borderStyle: 'solid',
                            borderColor: 'rgba(0,0,0,0.18) transparent transparent transparent',
                            zIndex: -1,
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-19px', // 吹き出しの三角形を下側に配置する場合
                            left: '70%', // 中央に配置
                            transform: 'translateX(-50%)', // 真ん中に位置合わせ
                            borderWidth: '10px',
                            borderStyle: 'solid',
                            borderColor: 'white transparent transparent transparent',
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
