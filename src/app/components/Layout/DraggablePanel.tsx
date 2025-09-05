import React, { FC } from 'react';
import { Box } from '@mui/material';
import { PanelConfig } from '@/app/types/layout';
import { TreeItems, DnclValidationType } from '@/app/types';
import { Dispatch, SetStateAction } from 'react';
import { DraggableTabContainer } from './DraggableTabContainer';
import { ConsoleTab } from '@/app/components/Tab/ConsoleTab';

interface DraggablePanelProps {
    panel: PanelConfig;
    treeItems: TreeItems;
    dnclValidation: DnclValidationType | null;
    setDnclValidation: (validation: DnclValidationType | null) => void;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const DraggablePanel: FC<DraggablePanelProps> = ({
    panel,
    treeItems,
    dnclValidation,
    setDnclValidation,
    runResults,
    setRunResults
}) => {
    return (
        <Box
            sx={{
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* パネルヘッダー */}
            <Box
                sx={{
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                {panel.type === 'console' ? '🖥️ コンソール' : '📝 コード変換'}
            </Box>

            {/* パネルコンテンツ */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {panel.type === 'console' ? (
                    <ConsoleTab
                        dnclValidation={dnclValidation}
                        setDnclValidation={setDnclValidation}
                        treeItems={treeItems}
                        runResults={runResults}
                        setRunResults={setRunResults}
                    />
                ) : (
                    <DraggableTabContainer
                        tabs={panel.tabs}
                        treeItems={treeItems}
                        panelId={panel.id}
                        dnclValidation={dnclValidation}
                        setDnclValidation={setDnclValidation}
                        runResults={runResults}
                        setRunResults={setRunResults}
                    />
                )}
            </Box>
        </Box>
    );
};

export default DraggablePanel;