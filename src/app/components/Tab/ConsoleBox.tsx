import Box from '@mui/material/Box';
import { BoxProps, useMediaQuery, useTheme } from '@mui/system';
import { Button } from '@mui/material';
import cmnStyles from '@/app/components/common.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Grid from '@mui/material/Grid2';
import React, { Dispatch, SetStateAction, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
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
    const theme = useTheme();
    const isDark = theme.palette?.mode === 'dark';

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--slategray)',
            position: 'relative',
            zIndex: 10,
            gridColumn: 'span 3',
            backgroundColor: isDark ? 'var(--slate-800)' : 'var(--gray-300)',
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
    runResults: string[];
}

export const ConsoleBox: React.FC<Props> = React.memo(({ children, tabLabels, setRunResults, runResults }) => {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));
    const [snackbar, setSnackbar] = React.useState<{ open: boolean, duration: number, text: string }>({
        open: false,
        duration: 3000,
        text: ''
    });
    const handleReset = useCallback(() => {
        setRunResults([]);
        setSnackbar({ open: true, duration: 2000, text: 'リセットしました' });
    }, [setRunResults]);

    const handleCopy = useCallback(() => {
        if (runResults && runResults.length > 0) {
            navigator.clipboard.writeText(runResults.join('\n'));
            setSnackbar({ open: true, duration: 3000, text: 'クリップボードにコピーしました' });
        }
    }, [runResults]);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

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
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        sx={{
                            marginRight: 1,
                            color: 'white',
                            borderColor: 'var(--darkgray)'
                        }}
                        onClick={handleCopy}
                    >
                        コピー
                    </Button>
                    <Button
                        size={isSm ? 'small' : 'medium'}
                        variant="outlined"
                        startIcon={<ClearAllIcon />}
                        sx={{
                            borderColor: 'var(--darkgray)',
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
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={snackbar.duration}
                open={snackbar.open}
                onClose={handleCloseSnackbar}
                message={snackbar.text}
            />
        </StyledBox>
    );
});

TabPanel.displayName = 'TabPanel';
StyledBox.displayName = 'StyledBox';
ConsoleBox.displayName = 'ConsoleBox';
