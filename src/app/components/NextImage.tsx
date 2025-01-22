import { Box } from "@mui/material";
import Image from "next/image";
import { FC } from "react";

type NextImageProps = {
    src: string;
    alt: string;
};

export const NextImage: FC<NextImageProps> = ({ src, alt }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                mb: 2,
            }}
        >
            <Image src={src} alt={alt} fill sizes="100vw" objectFit="cover" />
        </Box>
    );
};