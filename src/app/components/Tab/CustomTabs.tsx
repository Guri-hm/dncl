import { FC } from "react";
import { TabItem } from "@/app/types";
import { Tabs } from "@mui/material";
import { CustomTab } from "@/app/components/Tab";

interface TabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabItems: TabItem[];
    tabClasses?: string[];
    disabled?: boolean;
}

export const CustomTabs: FC<TabsProps> = ({ value, onChange, a11yProps, tabItems, tabClasses = [] }) => {
    // tabItemsが空の場合は何も表示しない
    if (tabItems.length === 0) {
        return null;
    }

    // 安全なvalue値を計算
    const safeValue = Math.min(Math.max(0, value), tabItems.length - 1);

    return (
        <Tabs
            sx={{
                minHeight: 'auto',
                // 完全なオーバーフロー表示設定
                overflow: 'visible !important',
                contain: 'none',
                isolation: 'auto',
                '& .MuiTabs-scroller': {
                    overflow: 'visible !important',
                    contain: 'none !important',
                },
                '& .MuiTabs-flexContainer': {
                    overflow: 'visible !important',
                    contain: 'none !important',
                },
                '& .MuiTabs-indicator': {
                    overflow: 'visible !important',
                },
                // すべての子要素のオーバーフローも表示
                '& *': {
                    overflow: 'visible !important',
                    clipPath: 'none !important',
                    contain: 'none !important',
                },
            }}
            value={safeValue}
            onChange={onChange}
            aria-label="tabs"
        >
            {tabItems.map((item, index) => (
                <CustomTab
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={(event) => onChange(event, index)}
                    tabClasses={tabClasses}
                    a11yProps={a11yProps}
                />
            ))}
        </Tabs>
    );
};