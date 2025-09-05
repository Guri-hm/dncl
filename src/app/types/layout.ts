// src/app/types/layout.ts
export interface TabConfig {
    id: string;
    label: string;
    type: 'dncl' | 'js' | 'python' | 'vba' | 'flow' | 'console';
}

export interface PanelConfig {
    id: string;
    type: 'tabs' | 'console';
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    tabs: TabConfig[];
}

export interface LayoutConfig {
    panels: PanelConfig[];
    layout: 'horizontal' | 'vertical' | 'grid';
}

export interface DraggablePanelProps {
    panel: PanelConfig;
    treeItems: any[];
    onTabMove?: (tabId: string, sourcePanelId: string, targetPanelId: string) => void;
}

export interface TabContainerProps {
    tabs: TabConfig[];
    treeItems: any[];
    panelId: string;
    dnclValidation: any;
    setDnclValidation: (validation: any) => void;
    runResults: string[];
    setRunResults: (results: string[]) => void;
}

export interface DraggableTabProps {
    tab: TabConfig;
    isActive: boolean;
    onClick: () => void;
    panelId: string;
}