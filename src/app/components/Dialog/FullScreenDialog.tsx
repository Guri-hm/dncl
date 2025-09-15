import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Box } from '@mui/material';
import { Dispatch, forwardRef, Fragment, ReactNode, SetStateAction } from 'react';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    title?: string;
    children: ReactNode;
}

export const FullScreenDialog = ({ open, setOpen, title = "", children }: Props) => {

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>

            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                slots={{ transition: Transition }}
            >
                <AppBar sx={{ position: 'relative', backgroundColor: 'var(--slate-950)' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {title}
                        </Typography>
                        {/* <Button autoFocus color="inherit" onClick={handleClose}>
                            save
                        </Button> */}
                    </Toolbar>
                </AppBar>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    {children}
                </Box>
            </Dialog>
        </Fragment>
    );
}
