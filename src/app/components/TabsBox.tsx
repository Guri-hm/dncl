import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps, styled } from '@mui/system';
import { Button, IconButton, Snackbar } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import { Children, FC, forwardRef, useRef, useState } from 'react';
import { useDraggable } from "@dnd-kit/core";

interface TabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabLabels: string[];
    tabClasses?: string[];
}

interface CustomTabProps {
    id: number;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabLabel: string;
    tabClasses?: string[];
}

const CustomTabs: FC<TabsProps> = ({ value, onChange, a11yProps, tabLabels, tabClasses = [] }) => {

    return (
        <Tabs sx={{ minHeight: 'unset' }} value={value} onChange={onChange} aria-label="tabs">
            {tabLabels.map((label, index) => (

                <DraggableTab id={index} key={label} a11yProps={a11yProps} tabLabel={label} tabClasses={tabClasses}></DraggableTab>

            ))}
        </Tabs>
    );
};

const CustomTabsTest: FC<TabsProps> = ({ value, onChange, a11yProps, tabLabels, tabClasses = [] }) => {
    return (
        <Tabs sx={{ minHeight: 'unset' }} value={value} onChange={onChange} aria-label="tabs">
            {tabLabels.map((label, index) => (
                <Tab key={label}
                    label={label}
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
                >
                </Tab>
            ))}
        </Tabs>
    );
};


interface StyledTabProps extends TabProps { className?: string; }
const StyledTab = styled((props: StyledTabProps) =>
(<Tab {...props} >



</Tab>))(({ theme }) =>
({
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
}));

const TestTab: FC<CustomTabProps> = ({ id, a11yProps, tabClasses = [], tabLabel }) => {

    return (
        <Tab key={tabLabel}
            label={tabLabel}
            className={tabClasses[id] || ''}
            {...a11yProps(id)}
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
        >
        </Tab>
    );
};

const DraggableTab: FC<CustomTabProps> = ({ id, a11yProps, tabClasses = [], tabLabel }) => {
    const {
        setNodeRef,
        listeners,
        attributes,
    } = useDraggable({
        id
    });
    return (
        <Tab key={tabLabel}
            label={tabLabel}
            className={tabClasses[id] || ''}
            {...a11yProps(id)}
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
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
        </Tab>
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
export default function TabsBox({ tabs, ...props }: Props) {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        alert(newValue)
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
                <CustomTabsTest
                    value={value}
                    onChange={handleChange}
                    a11yProps={a11yProps}
                    tabLabels={tabLabels}
                    tabClasses={tabLabels.map((_, index) => `${value === index ? styles.tabSelected : styles.tab}`)}
                />
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
