import { FC } from "react";
import { TabItem } from "../types";
import { Tabs } from "@mui/material";
import { CustomTab } from "./CustomTab";

interface TabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    tabItems: TabItem[];
    tabClasses?: string[];
    disabled?: boolean;
}

export const CustomTabs: FC<TabsProps> = ({ value, onChange, a11yProps, tabItems, tabClasses = [] }) => {
    //minHeightで最低限高さがないとwidthが効かない
    return (
        <Tabs sx={{ minHeight: 'auto' }} value={value} onChange={onChange} aria-label="tabs">

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