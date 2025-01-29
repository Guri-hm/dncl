import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import Grid from '@mui/material/Grid2';

type NextImageProps = {
    src: string;
    alt: string;
    size?: string | undefined;
    objectFit?: string;
};

export const NextImage: FC<NextImageProps> = ({ src, alt, size = "100vw", objectFit = "cover" }) => {
    return (
        <Image src={src} alt={alt} layout="fill" sizes={size} objectFit={objectFit} />
    );
};

const SpeechBubble = () => {
    return (
        <Box
            sx={{
                width: '100%', height: '100%', backgroundColor: 'var(--stone-50)'
            }}
        >
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
                            position: 'absolute',
                            width: '100%',
                            top: 0,
                            bgcolor: "var(--stone-50)",
                            borderRadius: "10px",
                            padding: "10px",
                            boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                            '&::after': {
                                content: '""',
                                position: 'relative',
                                top: '42px',
                                right: '40px',
                                borderWidth: '10px',
                                borderStyle: 'solid',
                                borderColor: 'var(--stone-50) transparent transparent transparent',
                                boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                            },
                        }}
                    >
                        ここにドロップします
                    </Grid>
                    <img src="/raise_one_hand.png" alt="手をあげる" style={{ width: '100%' }}></img>
                    {/* <NextImagek src="/raise_one_hand.png" alt="手をあげる" objectFit="contain" /> */}
                </Grid>
            </Grid>
        </Box>
    );
};

export default SpeechBubble;