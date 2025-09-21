import Box from '@mui/material/Box';
import { BoxProps, useTheme } from '@mui/system';
import { IconButton, ListItemIcon, Menu, MenuItem, Snackbar } from '@mui/material';
import cmnStyles from '@/app/components/common.module.css';
import { Children, Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { TabItem, TabItemsObj } from "@/app/types";
import Grid from '@mui/material/Grid2';
import { UniqueIdentifier } from '@dnd-kit/core';
import CloseIcon from '@mui/icons-material/Close';
import { TabPanel } from '@/app/components/Tab';


type Props = {
    tabItems: TabItem[];
    containerId?: UniqueIdentifier;
    setTabItemsObj?: Dispatch<SetStateAction<TabItemsObj>>;
}
const StyledBox: React.FC<BoxProps> = ({ children }) => {
    const theme = useTheme();
    return (<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, gridColumn: 'span 3', border: theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(71, 85, 105, 0.1)', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', '@xl': { marginLeft: 0 } }}>
        {children}
    </Box>);
};

const TabsSingleBox = ({ tabItems, setTabItemsObj, containerId = 'box', ...props }: Props) => {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleChange = (newValue: number) => {
        setValue(newValue);
        handleCloseMenu();
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
    const handleCloseBox = () => {
        updateGroupVisibility(containerId, false);
        handleCloseMenu();
    }
    const updateGroupVisibility = (groupKey: UniqueIdentifier, isVisible: boolean) => {
        if (!setTabItemsObj) return;
        setTabItemsObj((prevState: TabItemsObj) => ({
            ...prevState,
            [groupKey]: {
                ...prevState[groupKey],
                visible: isVisible,
            },
        }));
    };
    const tabPanels: React.ReactNode[] = useMemo(() => tabItems.map(tabItem => tabItem.component), [tabItems]);

    return (
        <StyledBox>
            <Grid size="auto" className={`${cmnStyles.bgSlate900} ${cmnStyles.colorWhite} ${cmnStyles.w100}`} sx={{
                paddingX: 1, paddingY: 0.5, flexBasis: '0%'
            }} container direction="row" justifyContent="space-between" alignItems="center">
                <Grid>
                    <Box>
                        {tabItems[value].label}
                    </Box>
                </Grid>
                <Grid>
                    <IconButton id="positioned-button" aria-controls={open ? 'positioned-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClickMenu} size='medium' sx={{ color: 'var(--stone-50)', display: 'flex', alignItems: 'center' }}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="positioned-menu"
                        aria-labelledby="positioned-button"
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
                        sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px' }}
                    >
                        {
                            tabItems.map((tabItem, index) => (
                                <MenuItem key={index} onClick={() => handleChange(index)}>
                                    {tabItem.label}
                                </MenuItem>
                            ))
                        }
                        {setTabItemsObj &&
                            <MenuItem onClick={handleCloseBox}>
                                <ListItemIcon>
                                    <CloseIcon fontSize="small" />
                                </ListItemIcon>
                                閉じる
                            </MenuItem>
                        }
                    </Menu>
                </Grid>
            </Grid>
            {
                Children.map(tabPanels, (child, index) => (
                    <TabPanel value={value} index={index} key={index} ref={contentRef}> {child} </TabPanel>
                ))
            }
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={snackbar.duration}
                open={snackbar.open}
                onClose={handleClose}
                message={snackbar.text}
            />
        </StyledBox>
    );
}

TabsSingleBox.displayName = "TabsSingleBox";

export default TabsSingleBox;