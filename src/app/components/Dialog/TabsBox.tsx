import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './tabs-box.module.css'

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


export default function TabsBox() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }} className="h-full border border-gray-600 relative z-10 col-span-3 bg-slate-800 shadow-lg xl:ml-0 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/10">

            <div className="relative flex text-slate-400 text-xs leading-6">

                <Tabs className={`${styles.textSkyColor}`} value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab className={value === 0 ? styles.tabSelected : styles.tab} label="Item One" {...a11yProps(0)} />
                    <Tab className={value === 1 ? styles.tabSelected : styles.tab} label="Item One" {...a11yProps(1)} />
                    <Tab className={value === 2 ? styles.tabSelected : styles.tab} label="Item One" {...a11yProps(2)} />
                </Tabs>

                <div className="flex-auto flex pt-2 rounded-tr-xl overflow-hidden">
                    <div className="flex-auto -mr-px bg-slate-700/50 border border-slate-500/30 rounded-tl"></div>
                </div>
                <div className="absolute top-2 right-0 h-8 flex items-center pr-4"><div className="relative flex -mr-2">
                    <button type="button" className="text-slate-500 hover:text-slate-400">
                        <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-8 h-8"><path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19"></path><path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5"></path></svg>
                    </button>
                </div>
                </div>
            </div>
            <div className="relative text-white">
                <CustomTabPanel value={value} index={0}>
                    Item One
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    Item Two
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    Item Three
                </CustomTabPanel>
            </div>
        </Box>
    );
}
