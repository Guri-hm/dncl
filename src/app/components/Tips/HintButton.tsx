import { Button } from '@mui/material';
import React, { useState } from 'react';
import { FullScreenDialog } from '@/app/components/Dialog';
import { HintMenu } from '@/app/components/Tips';
import Grid from '@mui/material/Grid2';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

export const HintButton = () => {

    const [open, setOpen] = useState(false);

    return (
        <Grid>
            <Button sx={{ backgroundColor: 'var(--sky-500)', borderRadius: 5 }} variant="contained" onClick={() => setOpen(true)} startIcon={<TipsAndUpdatesIcon />}>
                構文のヒント
            </Button>
            {open && <FullScreenDialog title="構文のヒント" open={open} setOpen={setOpen}><HintMenu />
            </FullScreenDialog>}
        </Grid>

    );
};
