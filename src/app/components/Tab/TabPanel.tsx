import cmnStyles from '@/app/components/common.module.css';
import { Box } from '@mui/material';
import { forwardRef } from "react";

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
                <Box
                    className={`${cmnStyles.overflowAuto}`}
                    sx={{
                        wordBreak: 'break-all',
                        flex: 1,
                        color: 'white',
                        margin: '15px',
                        // 明示的にオーバーフロー設定を上書き
                        overflow: 'auto !important',
                        contain: 'layout style !important',
                        clipPath: 'none',
                    }}
                    role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}
                    ref={ref}
                >
                    {children}
                </Box>
            }
        </>
    );
});

TabPanel.displayName = "TabPanel";
export default TabPanel;