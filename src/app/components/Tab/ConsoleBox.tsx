import Box from '@mui/material/Box';
import { BoxProps, useMediaQuery, useTheme } from '@mui/system';
import { Button } from '@mui/material';
import cmnStyles from '@/app/components/common.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Grid from '@mui/material/Grid2';
import React, { Dispatch, SetStateAction, useCallback } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = React.memo<TabPanelProps>(({ children, value, index }) => {
    if (value !== index) return null;

    return (
        <Box
            className={`${cmnStyles.overflowAuto}`}
            sx={{
                wordBreak: 'break-all',
                flex: 1,
                color: 'white',
                paddingLeft: '15px',
                paddingRight: '10px',
                paddingTop: '10px',
                paddingBottom: '30px'
            }}
            role="tabpanel"
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {children}
        </Box>
    );
});

const StyledBox: React.FC<BoxProps> = React.memo(({ children }) => {
    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--slategray)',
            position: 'relative',
            zIndex: 10,
            gridColumn: 'span 3',
            backgroundColor: '#1e293b',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            '@xl': { marginLeft: 0 }
        }}>
            {children}
        </Box>
    );
});

type Props = {
    children: React.ReactNode | React.ReactNode[];
    tabLabels: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const ConsoleBox: React.FC<Props> = React.memo(({ children, tabLabels, setRunResults }) => {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    const handleReset = useCallback(() => {
        setRunResults([]);
    }, [setRunResults]);

    return (
        <StyledBox>
            <Grid
                size="auto"
                className={`${cmnStyles.bgSlate900} ${cmnStyles.colorWhite} ${cmnStyles.w100}`}
                sx={{
                    paddingX: 1,
                    paddingY: isSm ? 0.5 : 1,
                    flexBasis: '0%'
                }}
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Grid>
                    <Box>
                        {tabLabels[0]}
                    </Box>
                </Grid>
                <Grid>
                    <Button
                        size={isSm ? 'small' : 'medium'}
                        variant="contained"
                        startIcon={<ClearAllIcon />}
                        sx={{
                            paddingLeft: '6px',
                            paddingRight: '4px',
                            paddingTop: '2px',
                            paddingBottom: '2px',
                            backgroundColor: 'var(--darkgray)',
                            color: 'white'
                        }}
                        onClick={handleReset}
                    >
                        リセット
                    </Button>
                </Grid>
            </Grid>
            {React.Children.map(children, (child, index) => (
                <TabPanel index={index} value={0} key={index}>
                    {child}
                </TabPanel>
            ))}
        </StyledBox>
    );
});