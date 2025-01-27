import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps } from '@mui/system';
import { Button, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import cmnStyles from '@/app/components/common.module.css';
import { Children, FC, forwardRef, useMemo, useRef, useState } from 'react';
import { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { TabItem } from '../types';
import { CustomTabs } from './CustomTabs';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MenuIcon from '@mui/icons-material/Menu';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

//refを渡すときはforwardRef
const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(({ children, index, value }, ref) => {
    return (
        <>
            {value === index &&
                <Box className={`${cmnStyles.overflowAuto}`} sx={{
                    wordBreak: 'break-all',
                    flex: 1,
                    color: 'white',
                    margin: '15px'
                }} role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`} ref={ref}>{children}</Box>
            }
        </>
    );
});

//a11yはaccessibilityの略記
export function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const TabsWrapper: FC<BoxProps> = ({ children, ref, style }) => {
    return (
        <Box ref={ref} className={`${styles.tabsWrapper} ${styles.dark}`} sx={{ ...style }}>
            {children}
        </Box>
    );
};
const Header: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            flexBasis: '0%',
            position: 'relative',
            display: 'flex',
            color: '#94a3b8',
            fontSize: '0.75rem',
            lineHeight: '1.5rem',
            paddingTop: '0.25rem'
        }} >
            {children}
        </Box>
    );
};

const TabFillerContainer: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            flex: 'auto',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
        }} >
            {children}
        </Box>
    );
};

const TabFillerInner: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            flex: '1',
            justifyContent: 'flex-end',
            alignItems: 'center',
            display: 'flex',
            marginRight: '-1px',
            backgroundColor: 'rgba(71, 85, 105, 0.5)', // bg-slate-700/50
            border: '1px solid rgba(71, 85, 105, 0.3)', // border-slate-500/30
        }} >
            {children}
        </Box>
    );
};

type Props = {
    tabItems: TabItem[];
    disabled?: boolean;
    containerId?: UniqueIdentifier
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const TabPanelsWrapper: FC<BoxProps & { containerId: UniqueIdentifier, items: TabItem[], disabled?: boolean; }> = ({ children, containerId, items, disabled }) => {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transition,
        transform,
    } = useSortable({
        id: containerId,
        data: {
            type: "container",
            children: items,
        },
        animateLayoutChanges,
    });
    return (
        <Box className={`${styles.tabsWrapper} ${styles.dark}`} ref={disabled ? undefined : setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.5 : undefined,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            {...attributes}
            {...listeners}>
            {children}
        </Box>
    );
};

export const TabsBox = ({ tabItems, disabled, containerId = 'box', ...props }: Props) => {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    const tabPanels: React.ReactNode[] = useMemo(() => tabItems.map(tabItem => tabItem.component), [tabItems]);

    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transition,
        transform,
        setActivatorNodeRef
    } = useSortable({
        id: containerId,
        data: {
            type: "container",
            children: tabItems,
        },
        animateLayoutChanges,
    });
    return (
        <TabsWrapper ref={setNodeRef} style={{
            transition,
            transform: CSS.Translate.toString(transform),
            opacity: isDragging ? 0.5 : undefined,
        }}>
            <SortableContext key={containerId} items={tabItems}>
                <Header>
                    <CustomTabs
                        value={value}
                        onChange={handleChange}
                        a11yProps={a11yProps}
                        tabItems={tabItems}
                        tabClasses={tabItems.map((_, index) => `${value === index ? styles.tabSelected : styles.tab}`)}
                        disabled={disabled}
                    />
                    <TabFillerContainer>
                        <TabFillerInner>
                            <IconButton size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--stone-50)' } }} aria-label="clipboard" onClick={() => {
                                if (contentRef.current) {
                                    const content = contentRef.current.textContent;
                                    if (!content) {
                                        return;
                                    }
                                    navigator.clipboard.writeText(content).then(() => {
                                        setSnackbar({ ...snackbar, open: true, text: 'クリップボードにコピーしました' });
                                    }, (err) => {
                                        console.error(err);
                                        setSnackbar({ ...snackbar, open: true, text: '失敗しました' });
                                    });
                                }
                            }}>
                                <AssignmentIcon />
                            </IconButton>
                            <IconButton size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--stone-50)' } }} aria-label="clipboard" ref={setActivatorNodeRef} {...attributes} {...listeners} style={{
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}>
                                <SwapHorizIcon />
                            </IconButton>
                            <div>
                                <IconButton id="demo-positioned-button" aria-controls={open ? 'demo-positioned-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClickMenu} size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--stone-50)' } }}>
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    id="demo-positioned-menu"
                                    aria-labelledby="demo-positioned-button"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleCloseMenu}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
                                    <MenuItem onClick={handleCloseMenu}>My account</MenuItem>
                                    <MenuItem onClick={handleCloseMenu}>Logout</MenuItem>
                                </Menu>
                            </div>
                        </TabFillerInner>
                    </TabFillerContainer>
                </Header>
            </SortableContext>
            {/* <TabPanelsWrapper containerId={containerId} items={tabItems}> */}
            {
                Children.map(tabPanels, (child, index) => (
                    <TabPanel value={value} index={index} key={index} ref={contentRef}> {child} </TabPanel>
                ))
            }
            {/* </TabPanelsWrapper> */}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={snackbar.duration}
                open={snackbar.open}
                onClose={handleClose}
                message={snackbar.text}
            />
        </TabsWrapper >
    );
}
