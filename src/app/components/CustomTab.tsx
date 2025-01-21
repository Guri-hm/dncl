import { FC } from "react";
import { TabItem } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { Box, Tab } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import cmnStyles from '@/app/components/common.module.css';
import { Handle } from "./TreeItem/Handle";

interface CustomTabProps {
    item: TabItem;
    children?: React.ReactNode;
    index: number;
    tabClasses?: string[];
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    onClick: (event: React.SyntheticEvent) => void;
}

export const CustomTab: FC<CustomTabProps> = ({ item, a11yProps, index, onClick, tabClasses = [] }) => {
    const { isDragging, setActivatorNodeRef, attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    return (
        <Box className={`${isDragging ? cmnStyles.zIndexMax : ''} ${tabClasses[index] || ''}`} ref={setNodeRef} style={{
            transform: CSS.Transform.toString(transform),
            transition,
            display: 'flex',
        }}>
            <span ref={setActivatorNodeRef}>
                <Handle {...attributes} {...listeners} cursor={isDragging ? 'grabbing' : "grab"} />
            </span>
            <Tab
                key={index}
                label={item.label}
                onClick={onClick}
                {...a11yProps(index)}
                sx={{
                    flex: 'none',
                    fontWeight: 600,
                    borderTop: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    minHeight: 'auto',
                    minWidth: 'auto',
                    paddingLeft: '3px',
                    paddingRight: '10px',
                    margin: '0px'
                }}
            />
        </Box>
    );
};

