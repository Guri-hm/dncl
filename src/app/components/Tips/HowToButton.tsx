import { Button } from '@mui/material';
import React, { useState } from 'react';
import { FullScreenDialog } from '@/app/components/Dialog';
import Grid from '@mui/material/Grid2';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {InfoStepper} from '@/app/components/Tips';

export const HowToButton = () => {

    const [open, setOpen] = useState(false);

    return (
        <Grid>
            <Button sx={{ backgroundColor: 'var(--sky-500)', borderRadius: 5 }} variant="contained" onClick={() => setOpen(true)} startIcon={<HelpOutlineIcon />}>
                使い方
            </Button>
            {open && <FullScreenDialog title="使い方" open={open} setOpen={setOpen}>
                <InfoStepper /></FullScreenDialog>}
        </Grid>

    );
};
