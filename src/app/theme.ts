import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
    typography: {
        fontFamily: 'YakuHanJPs, Roboto, "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", Arial, nc3Jp, sans-serif',
        h1: {
            fontSize: '1.9rem !important',
            '@media (min-width:600px)': {
                fontSize: '2.4rem !important',
            },
        },
        h2: {
            fontSize: '1.5rem !important',
            '@media (min-width:600px)': {
                fontSize: '2.0rem !important',
            },
        },
        h3: {
            fontSize: '1.125rem',
            '@media (min-width:600px)': {
                fontSize: '1.75rem',
            },
        },
        h4: {
            fontSize: '1rem',
            '@media (min-width:600px)': {
                fontSize: '1.5rem',
            },
        },
        h5: {
            fontSize: '0.875rem',
            '@media (min-width:600px)': {
                fontSize: '1.25rem',
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;