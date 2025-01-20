import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps } from '@mui/system';
import { Button, IconButton, Snackbar } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import { Children, FC, forwardRef, ReactNode, useRef, useState } from 'react';
import { UniqueIdentifier, useDraggable, useDroppable } from "@dnd-kit/core";
import { Handle } from "@/app/components/TreeItem/Handle";
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { TabItem, TabItemsObj } from '../types';

interface TabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabItems: TabItem[];
    tabClasses?: string[];
    disabled?: boolean;
}

interface CustomTabProps {
    item: TabItem;
    children?: React.ReactNode;
    index: number;
    tabClasses?: string[];
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    onClick: (event: React.SyntheticEvent) => void;
}

// const DroppableArea: React.FC<DroppableAreaProps> = ({ id, children }) => {
//     const { setNodeRef } = useDroppable({ id });

//     return (
//         <div ref={setNodeRef}>
//             {children}
//         </div>
//     );
// };
export const CustomTab: FC<CustomTabProps> = ({ item, a11yProps, index, onClick, tabClasses = [] }) => {
    const { isDragging, setActivatorNodeRef, attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    return (
        <Box className={`${isDragging ? cmnStyles.zIndexMax : ''}`} ref={setNodeRef} style={{
            transform: CSS.Transform.toString(transform),
            transition,
            display: 'flex',
        }}>
            <span ref={setActivatorNodeRef}>
                <Handle {...attributes} {...listeners} cursor={isDragging ? 'grabbing' : "grab"} />
            </span>
            <Tab
                key={index}
                label={item.label}
                onClick={onClick}
                // className={tabClasses[index] || ''}
                // {...a11yProps(index)}
                sx={{
                    flex: 'none',
                    color: '#38bdf8',
                    borderTop: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    minHeight: 'auto',
                    padding: '10px',
                }}
            />
        </Box>
    );
};

export const CustomTabs: FC<TabsProps> = ({ value, onChange, a11yProps, tabItems, tabClasses = [] }) => {
    return (
        <Tabs sx={{ minHeight: 'unset' }} value={value} onChange={onChange} aria-label="tabs">

            {tabItems.map((item, index) => (
                <CustomTab
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={(event) => onChange(event, index)}
                    tabClasses={tabClasses}
                    a11yProps={a11yProps}
                />
            ))}
        </Tabs>
    );
};

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

const TabsWrapper: FC<BoxProps> = ({ children }) => {
    return (
        <Box className={`${styles.tabsWrapper} ${styles.dark}`}>
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
            paddingTop: '0.5rem',
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

type DroppableProp = {
    id: string;
    children: ReactNode;
};
const Droppable: FC<DroppableProp> = ({ children, id }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "droppable-area",
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: isOver ? "lightgreen" : "",
            }}
        >
            {children}
        </div>
    );
}

export default function TabsBox({ tabItems, disabled, containerId = 'box', ...props }: Props) {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const tabPanels: React.ReactNode[] = tabItems.map(tabItem => { return tabItem.component });

    return (
        <TabsWrapper>
            <Header>
                <SortableContext key={containerId} items={tabItems}>
                    <CustomTabs
                        value={value}
                        onChange={handleChange}
                        a11yProps={a11yProps}
                        tabItems={tabItems}
                        tabClasses={tabItems.map((_, index) => `${value === index ? styles.tabSelected : styles.tab}`)}
                        disabled={disabled}
                    />
                </SortableContext>
                <TabFillerContainer>
                    <TabFillerInner>
                        <IconButton size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: '#fff' } }} aria-label="clipboard" onClick={() => {
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
                    </TabFillerInner>
                </TabFillerContainer>
            </Header>
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
        </TabsWrapper >
    );
}
