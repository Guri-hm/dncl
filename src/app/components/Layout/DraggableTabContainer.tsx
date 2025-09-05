import React, { FC, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { TabConfig } from '@/app/types/layout';
import { TreeItems, DnclValidationType } from '@/app/types';
import { Dispatch, SetStateAction } from 'react';
import { DnclTab } from '@/app/components/Tab/DnclTab';
import { JsTab } from '@/app/components/Tab/JsTab';
import { PythonTab } from '@/app/components/Tab/PythonTab';
import { VbaTab } from '@/app/components/Tab/VbaTab';
import { FlowTab } from '@/app/components/Tab/FlowTab';

interface DraggableTabContainerProps {
    tabs: TabConfig[];
    treeItems: TreeItems;
    panelId: string;
    dnclValidation: DnclValidationType | null;
    setDnclValidation: (validation: DnclValidationType | null) => void;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const DraggableTabContainer: FC<DraggableTabContainerProps> = ({
    tabs,
    treeItems,
    panelId,
    dnclValidation,
    setDnclValidation,
    runResults,
    setRunResults
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const renderTabContent = (tab: TabConfig) => {
        const commonProps = {
            treeItems,
            dnclValidation,
            setDnclValidation,
            runResults,
            setRunResults
        };

        switch (tab.type) {
            case 'dncl':
                return <DnclTab {...commonProps} />;
            case 'js':
                return <JsTab {...commonProps} />;
            case 'python':
                return <PythonTab {...commonProps} />;
            case 'vba':
                return <VbaTab {...commonProps} />;
            case 'flow':
                return <FlowTab {...commonProps}>フローチャート</FlowTab>;
            default:
                return <Box>タブが見つかりません</Box>;
        }
    };

    if (tabs.length === 0) {
        return <Box>タブがありません</Box>;
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* タブヘッダー */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                    minHeight: '40px',
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                {tabs.map((tab, index) => (
                    <Tab
                        key={tab.id}
                        label={tab.label}
                        sx={{
                            minHeight: '40px',
                            textTransform: 'none',
                            fontSize: '14px'
                        }}
                    />
                ))}
            </Tabs>

            {/* タブコンテンツ */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {tabs.map((tab, index) => (
                    <Box
                        key={tab.id}
                        sx={{
                            height: '100%',
                            display: activeTab === index ? 'block' : 'none'
                        }}
                    >
                        {renderTabContent(tab)}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default DraggableTabContainer;