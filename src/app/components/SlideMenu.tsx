import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}



const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const Overlay = styled('div')<{ open: boolean }>(({ theme, open }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: theme.zIndex.drawer - 1,
    display: open ? 'block' : 'none',
}));
interface MiniDrawerProps {
    children?: React.ReactNode;
    activeId?: string | null;//親コンポーネントでドラッグ中は文字列が入る
    open: boolean;
    setOpen: any;
}


const MiniDrawer: React.FC<MiniDrawerProps> = ({ children, activeId, open, setOpen }) => {
    const theme = useTheme();

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    React.useEffect(() => {
        if (activeId) {
            setOpen(false);
        }
    }, [activeId]);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Overlay open={open} onClick={toggleDrawer(false)} />
            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    {open ?
                        <IconButton onClick={toggleDrawer(false)}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                        :
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer(true)}
                            edge="start"

                        >
                            <MenuIcon />
                        </IconButton>
                    }
                </DrawerHeader>
                <Box>
                    {children}
                </Box>
            </Drawer>
        </Box>
    );
}

export default MiniDrawer;