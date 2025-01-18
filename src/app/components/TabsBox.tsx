import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps, createTheme, styled, ThemeProvider } from '@mui/system';
import { Alert, CssBaseline, IconButton, Snackbar } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import { Children, forwardRef, useRef, useState } from 'react';



interface StyledTabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabLabels: string[];
    tabClasses?: string[];
}

const StyledTabs = styled((props: StyledTabsProps) => {
    const { value, onChange, a11yProps, tabLabels, tabClasses = [] } = props;
    return (
        <Tabs sx={{ minHeight: 'unset' }} value={value} onChange={onChange} aria-label="tabs">
            {tabLabels.map((label, index) => (
                <StyledTab
                    key={label}
                    className={tabClasses[index] || ''}
                    label={label}
                    {...a11yProps(index)}
                />
            ))}
        </Tabs>
    );
})(({ theme }) => ({})); // 必要に応じてスタイルを追加

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

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface StyledTabProps extends TabProps { className?: string; }
const StyledTab = styled((props: StyledTabProps) =>
    (<Tab {...props} />))(({ theme }) =>
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


const StyledBox = styled((props: BoxProps) => (
    <Box {...props} />
))(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #4b5563',
    position: 'relative',
    zIndex: 10,
    gridColumn: 'span 3',
    backgroundColor: '#1e293b',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.up('xl')]: {
        marginLeft: 0,
    },
    '&.dark': {
        boxShadow: 'none',
        ring: 1,
        ringInset: true,
        ringColor: 'rgba(255, 255, 255, 0.1)',
    },
}));

const Header = styled((props: BoxProps) => (
    <Box {...props} />
))(({ theme }) => ({
    flexBasis: '0%',
    position: 'relative',
    display: 'flex',
    color: '#94a3b8',
    fontSize: '0.75rem',
    lineHeight: '1.5rem',
}));

const TabFillerContainer = styled(Box)(({ theme }) => ({
    flex: 'auto',
    display: 'flex',
    paddingTop: '0.5rem',
    overflow: 'hidden',
    position: 'relative',
}));

const TabFillerInner = styled(Box)(({ theme }) => ({
    flex: '1',
    justifyContent: 'flex-end',
    alignItems: 'center',
    display: 'flex',
    marginRight: '-1px',
    backgroundColor: 'rgba(71, 85, 105, 0.5)', // bg-slate-700/50
    border: '1px solid rgba(71, 85, 105, 0.3)', // border-slate-500/30
}));

type Props = {
    children: React.ReactNode | React.ReactNode[];
    tabLabels: string[];
}
export default function TabsBox({ children, tabLabels, ...props }: Props) {
    const [value, setValue] = useState(0);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <StyledBox>
            <Header>
                <StyledTabs
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
                Children.map(children, (child, index) => (
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
        </StyledBox >
    );
}
