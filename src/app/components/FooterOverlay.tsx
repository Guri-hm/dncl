import Grid, { Grid2Props } from '@mui/material/Grid2';

export const FooterOverlay: React.FC<Grid2Props> = ({ children }) => {
    return (
        <Grid container direction={"row"} columnSpacing={1} sx={{ position: 'absolute', right: '10px', bottom: '10px', zIndex: 20 }} >
            {children}

        </Grid>
    );
};
