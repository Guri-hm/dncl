import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps } from '@mui/system';
import { Button, IconButton, Snackbar } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import { Children, FC, forwardRef, ReactNode, useRef, useState } from 'react';
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Handle } from "@/app/components/TreeItem/Handle";

interface TabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabLabels: string[];
    tabClasses?: string[];
}

interface CustomTabProps {
    id: number;
    children?: React.ReactNode;
    index: number;
    label: string;
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
const CustomTab: FC<CustomTabProps> = ({ id, a11yProps, index, label, onClick, tabClasses = [] }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div ref={setNodeRef} style={{
            transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`, display: 'flex'
        }}>
            <Handle {...attributes} {...listeners} />
            <Tab
                key={index}
                label={label}
                onClick={onClick}
                className={tabClasses[index] || ''}
                {...a11yProps(index)}
                sx={{
                    marginTop: '0.5rem',
                    flex: 'none',
                    color: '#38bdf8',
                    borderTop: 'transparent',
                    paddingX: '1rem',
                    paddingY: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    minHeight: 'auto',
                    padding: '10px',
                }}
            />
        </div>
    );
};

const CustomTabs: FC<TabsProps> = ({ value, onChange, a11yProps, tabLabels, tabClasses = [] }) => {
    return (
        <Tabs sx={{ minHeight: 'unset' }} value={value} onChange={onChange} aria-label="tabs">
            {tabLabels.map((label, index) => (
                <CustomTab
                    key={index}
                    id={index}
                    label={label}
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
function a11yProps(index: number) {
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

interface Tab {
    title: string;
    component: React.ReactNode
}

type Props = {
    tabs: Tab[];
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

export default function TabsBox({ tabs, ...props }: Props) {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const tabLabels: string[] = tabs.map(tab => { return tab.title });
    const tabPanels: React.ReactNode[] = tabs.map(tab => { return tab.component });

    return (
        <TabsWrapper>
            <Header>
                <Droppable id="droppableArea">

                    <CustomTabs
                        value={value}
                        onChange={handleChange}
                        a11yProps={a11yProps}
                        tabLabels={tabLabels}
                        tabClasses={tabLabels.map((_, index) => `${value === index ? styles.tabSelected : styles.tab}`)}
                    />
                </Droppable>

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
