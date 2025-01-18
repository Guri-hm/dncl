import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'
import { BoxProps, styled } from '@mui/system';
import { Button, IconButton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    onChange?: any;
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

function TabPanel(params: TabPanelProps) {
    const { children, value, index, ...props } = params;

    return (
        <>
            {value === index &&
                <Box className={`${cmnStyles.overflowAuto}`} sx={{
                    wordBreak: 'break-all',
                    flex: 1,
                    color: 'white',
                    paddingLeft: '15px',
                    paddingRight: '10px',
                    paddingTop: '10px',
                    paddingBottom: '30px'
                }} role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`} {...props}>
                    {children}
                </Box>
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
export const ConsoleBoxTes = ({ children, tabLabels, ...props }: Props) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleChangeTest = (event: any) => { console.log('イベントが発生しました:', event); };

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
                        <Button variant="contained" startIcon={<ClearAllIcon sx={{ fontSize: '10px' }} />} sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px', backgroundColor: 'var(--darkgray)', color: 'white' }}
                            onClick={() => {
                            }}>
                            リセット
                        </Button>
                    </TabFillerInner>
                </TabFillerContainer>
            </Header>
            {React.Children.map(children, (child, index) => (
                <TabPanel index={index} value={value} key={index} onChange={handleChange}>
                    {child}
                </TabPanel>
            ))}
        </StyledBox>
    );
};
