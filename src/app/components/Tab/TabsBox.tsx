import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps } from '@mui/system';
import { IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import { Children, Dispatch, FC, SetStateAction, useMemo, useRef, useState, useEffect } from 'react';
import { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { CustomTabs, TabPanel } from '@/app/components/Tab';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MenuIcon from '@mui/icons-material/Menu';
import { TabItem, TabItemsObj } from "@/app/types";

//a11yはaccessibilityの略記
export function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const TabsWrapper: FC<BoxProps> = ({ children, ref, style }) => {
    return (
        <Box
            ref={ref}
            className={`${styles.tabsWrapper} ${styles.dark}`}
            sx={{
                ...style,
                // ドラッグ要素のオーバーフローのみ表示、他は通常通り
                overflow: 'visible !important',
                position: 'relative',
                zIndex: 1,
                contain: 'none',
                isolation: 'auto',
                clipPath: 'none',
                // ドラッグ関連の要素のみオーバーフロー設定を調整
                '& .MuiTabs-root': {
                    overflow: 'visible !important',
                    '& *': {
                        clipPath: 'none !important',
                        contain: 'none !important',
                        overflow: 'visible !important',
                    },
                },
                // TabPanelは通常のオーバーフロー動作を維持
                '& [role="tabpanel"]': {
                    overflow: 'auto !important',
                },
            }}
        >
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
            paddingTop: '0.25rem',
            // 完全なオーバーフロー表示設定
            overflow: 'visible !important',
            contain: 'none',
            clipPath: 'none',
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
    containerId?: UniqueIdentifier;
    setTabItemsObj?: Dispatch<SetStateAction<TabItemsObj>>;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const TabsBox = ({ tabItems, disabled, containerId = 'box', setTabItemsObj, ...props }: Props) => {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // tabItemsが変更された時にvalueを適切に調整
    useEffect(() => {
        if (tabItems.length === 0) {
            setValue(0);
        } else if (value >= tabItems.length) {
            setValue(Math.max(0, tabItems.length - 1));
        }
    }, [tabItems.length, value]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        // 有効な範囲内かチェック
        if (newValue >= 0 && newValue < tabItems.length) {
            setValue(newValue);
        }
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
    const handleShowBoxs = () => {
        toggleAllVisible(true);
        handleCloseMenu();
    }
    const handleMaximumBox = () => {
        updateOtherGroupsVisibility(containerId, false);
        handleCloseMenu();
    }
    const tabPanels: React.ReactNode[] = useMemo(() => tabItems.map(tabItem => tabItem.component), [tabItems]);

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

    const updateOtherGroupsVisibility = (groupKey: UniqueIdentifier, isVisible: boolean) => {
        if (!setTabItemsObj) return;
        setTabItemsObj((prevState: TabItemsObj) => {
            const updatedObj: TabItemsObj = {};

            for (const key in prevState) {
                if (key !== groupKey) {
                    updatedObj[key] = {
                        ...prevState[key],
                        visible: isVisible,
                    };
                } else {
                    updatedObj[key] = {
                        ...prevState[key],
                    };
                }
            }

            return updatedObj;
        });
    };
    const toggleAllVisible = (newVisible: boolean) => {
        if (!setTabItemsObj) return;
        setTabItemsObj((prevState: TabItemsObj) => {
            const updatedObj: TabItemsObj = {};
            for (const group in prevState) {
                updatedObj[group] = {
                    ...prevState[group],
                    visible: newVisible,
                };
            }
            return updatedObj;
        });
    };
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

    // 空のTabsBoxの場合は何も表示しない（削除される）
    if (tabItems.length === 0) {
        return null;
    }

    // 安全なvalue値を計算
    const safeValue = Math.min(Math.max(0, value), tabItems.length - 1);

    return (
        <TabsWrapper ref={setNodeRef} style={{
            transition,
            transform: CSS.Translate.toString(transform),
            opacity: isDragging ? 0.5 : undefined,
            zIndex: isDragging ? 1000 : 'auto',
            position: 'relative',
        }}>
            <SortableContext key={`${containerId}-${tabItems.length}`} items={tabItems}>
                <Header>
                    <CustomTabs
                        value={safeValue}
                        onChange={handleChange}
                        a11yProps={a11yProps}
                        tabItems={tabItems}
                        tabClasses={tabItems.map((_, index) => `${safeValue === index ? styles.tabSelected : styles.tab}`)}
                        disabled={disabled}
                    />
                    <TabFillerContainer>
                        <TabFillerInner>
                            {tabItems[safeValue] && tabItems[safeValue].label == 'フローチャート' ? '' :
                                <IconButton size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--stone-50)' } }} aria-label="clipboard" onClick={() => {
                                    if (contentRef.current) {
                                        const replaceDivWithNewline = (html: string) => {
                                            // divタグを改行コードに変換
                                            let formattedText = html.replace(/<div[^>]*>/g, '\n').replace(/<\/div>/g, '');
                                            // 不要な空行を削除
                                            formattedText = formattedText.replace(/\n\s*\n/g, '\n').trim();
                                            return formattedText;
                                        }
                                        const innerHTML = contentRef.current.innerHTML;
                                        if (!innerHTML) {
                                            return;
                                        }
                                        const formattedText = replaceDivWithNewline(innerHTML);
                                        navigator.clipboard.writeText(formattedText).then(() => {
                                            setSnackbar({ ...snackbar, open: true, text: 'クリップボードにコピーしました' });
                                        }, (err) => {
                                            console.error(err);
                                            setSnackbar({ ...snackbar, open: true, text: '失敗しました' });
                                        });
                                    }
                                }}>
                                    <AssignmentIcon />
                                </IconButton>
                            }
                            <IconButton
                                size='small'
                                sx={{
                                    color: 'var(--slate-500)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&:hover': { color: 'var(--stone-50)' },
                                    // ドラッグ中の視覚的強調
                                    backgroundColor: isDragging ? 'rgba(0, 127, 255, 0.2)' : 'transparent',
                                    transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'all 0.2s ease',
                                }}
                                aria-label="move-container"
                                ref={setActivatorNodeRef}
                                {...attributes}
                                {...listeners}
                                style={{
                                    cursor: isDragging ? 'grabbing' : 'grab'
                                }}
                            >
                                <SwapHorizIcon />
                            </IconButton>
                            <div>
                                <IconButton id="positioned-button" aria-controls={open ? 'positioned-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClickMenu} size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: 'var(--stone-50)' } }}>
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
                                >
                                    <MenuItem onClick={handleCloseBox}>このパネルを閉じる</MenuItem>
                                    <MenuItem onClick={handleMaximumBox}>このパネルを最大化</MenuItem>
                                    <MenuItem onClick={handleShowBoxs}>再表示</MenuItem>
                                </Menu>
                            </div>
                        </TabFillerInner>
                    </TabFillerContainer>
                </Header>
            </SortableContext>
            {
                Children.map(tabPanels, (child, index) => (
                    <TabPanel value={safeValue} index={index} key={index} ref={contentRef}> {child} </TabPanel>
                ))
            }
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

TabsBox.displayName = "TabsBox";

export default TabsBox;