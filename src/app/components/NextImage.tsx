import { Box, SxProps, Theme } from "@mui/material";
import Image from "next/image";
import { FC } from "react";

type NextImageProps = {
    src: string;
    alt: string;
    size?: string | undefined;
    sx?: SxProps<Theme>;
    style?: React.CSSProperties;
    onDragStart?: (event: React.DragEvent<HTMLImageElement>) => void;
};

export const NextImage: FC<NextImageProps> = ({ src, alt, size = "100vw", sx, style = { objectFit: 'cover' }, ...props }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                mb: 2,
                ...sx
            }}
        >
            <Image src={src} alt={alt} fill sizes={size} style={{ ...style }} {...props} />
        </Box>
    );
};