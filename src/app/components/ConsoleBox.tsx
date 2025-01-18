import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { BoxProps, styled } from '@mui/system';
import { Button, IconButton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import cmnStyles from '@/app/components/common.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Grid from '@mui/material/Grid2';

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

function TabPanel(params: TabPanelProps) {
    const { children, value, index, } = params;

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
                    aria-labelledby={`simple-tab-${index}`}>
                    {children}
                </Box>
            }

        </>
    );
}

const StyledBox: React.FC<BoxProps> = ({ children }) => {
    return (<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #4b5563', position: 'relative', zIndex: 10, gridColumn: 'span 3', backgroundColor: '#1e293b', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', '@xl': { marginLeft: 0 } }}>
        {children}
    </Box>);
};

type Props = {
    children: React.ReactNode | React.ReactNode[];
    tabLabels: string[];
    setRunResults: any;
}
export const ConsoleBox = ({ children, tabLabels, setRunResults }: Props) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <StyledBox>
            <Grid size="auto" className={`${cmnStyles.bgSlate900} ${cmnStyles.colorWhite} ${cmnStyles.w100}`} sx={{
                paddingX: 1, paddingY: 0.5, flexBasis: '0%'
            }} container direction="row" justifyContent="space-between" alignItems="center">
                <Grid>
                    <Box>
                        コンソール
                    </Box>
                </Grid>
                <Grid>
                    <Button variant="contained" startIcon={<ClearAllIcon sx={{ fontSize: '10px' }} />} sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px', backgroundColor: 'var(--darkgray)', color: 'white' }}
                        onClick={() => {
                            setRunResults([]);
                        }}>
                        リセット
                    </Button>
                </Grid>
            </Grid>
            {React.Children.map(children, (child, index) => (
                <TabPanel index={index} value={value} key={index}>
                    {child}
                </TabPanel>
            ))}
        </StyledBox>
    );
};
