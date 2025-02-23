import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import { ArrowButton } from './ArrowButton';
import { useCallback, useEffect } from 'react';

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
    // padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'sx',
})(({ theme, open, sx }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': {
            ...openedMixin(theme),
            ...sx, // sxプロパティのスタイルを追加
        },
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': {
            ...closedMixin(theme),
            ...sx, // sxプロパティのスタイルを追加
        },
    }),
}));

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
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


const MiniDrawer: React.FC<MiniDrawerProps> = ({ children, activeId, open, setOpen }) => {

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    useEffect(() => {
        if (activeId) {
            setOpen(false);
        }
    }, [activeId, setOpen]);

    return (
        <Box sx={{ display: 'flex' }}>
            <Overlay open={open} onClick={handleClose} />
            <Drawer variant="permanent" open={open} sx={{ backgroundColor: 'var(--slate-300)' }}>
                <DrawerHeader>
                    <ArrowButton setVisible={setOpen} visible={open}></ArrowButton>
                </DrawerHeader>
                <Box>
                    {children}
                </Box>
            </Drawer>
        </Box >
    );
}

export default MiniDrawer;