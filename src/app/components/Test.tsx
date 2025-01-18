import { Box, Button } from '@mui/material';
import React from 'react';

interface ParentComponentProps {
    children: React.ReactNode;
}

interface ChildComponentProps {
    onChange?: (event: React.ChangeEvent<any>) => void;
}

interface TabPanelProps {
    onChange: (event: React.ChangeEvent<any>) => void;
    children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ onChange, children }) => {
    return (
        <div>
            <div onClick={() => onChange({ type: 'tab', value: 0 })}>
                タブ 1
            </div>
            {children}
        </div>
    );
};

export const ParentComponent: React.FC<ParentComponentProps> = ({ children }) => {
    const handleChange = (event: { type: string; value: number }) => {
        console.log('イベントが発生しました:', event);
    };

    return (
        <Box>
            <Button variant="contained" sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px', backgroundColor: 'var(--darkgray)', color: 'white' }}
                onClick={() => {
                    handleChange({ type: 'reset', value: 0 });
                }}>
                リセット
            </Button>
            {React.Children.map(children, (child, index) => (
                <TabPanel onChange={handleChange}>
                    {child}
                </TabPanel>
            ))}
        </Box>
    );
};

export const ChildComponent: React.FC<ChildComponentProps> = ({ onChange }) => {
    const handleChildChange = (event: React.ChangeEvent<any>) => {
        console.log('子コンポーネントでイベントが発生しました:', event);

        if (onChange) {
            onChange(event);
        }
    };

    return (
        <div onClick={handleChildChange}>
            子コンポーネントの内容
        </div>
    );
};
