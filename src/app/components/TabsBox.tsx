import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps, createTheme, styled, ThemeProvider } from '@mui/system';
import { CssBaseline, IconButton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

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

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    const StyledBox = styled(Box)({
        overflow: 'auto', // 初期状態ではスクロールバーを非表示
        // overflow: 'auto', // 初期状態ではスクロールバーを非表示
        '&:hover': {
            // overflow: 'auto', // ホバー時にスクロールバーを表示
        },
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    });

    return (
        <>

            {value === index &&

                <StyledBox sx={{
                    wordBreak: 'break-all',
                    flex: 1,
                    color: 'white',
                    margin: '15px'
                }} role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}>{children}</StyledBox>

            }
        </>
    );
}

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
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
                        <IconButton size='small' sx={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', '&:hover': { color: '#fff' } }} aria-label="clipboard">
                            <AssignmentIcon />
                        </IconButton>
                    </TabFillerInner>
                </TabFillerContainer>
            </Header>
            {React.Children.map(children, (child, index) => (
                <TabPanel value={value} index={index} key={index}> {child} </TabPanel>
            ))}
        </StyledBox>
    );
}
