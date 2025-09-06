import { FC } from "react";
import { TabItem } from "@/app/types";
import { useSortable } from "@dnd-kit/sortable";
import { Box, Tab } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import cmnStyles from '@/app/components/common.module.css';
import { Handle } from "@/app/components/TreeItem/Handle";

interface CustomTabProps {
    item: TabItem;
    children?: React.ReactNode;
    index: number;
    tabClasses?: string[];
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    onClick: (event: React.SyntheticEvent) => void;
}

export const CustomTab: FC<CustomTabProps> = ({ item, a11yProps, index, onClick, tabClasses = [] }) => {
    const {
        isDragging,
        setActivatorNodeRef,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: item.id,
        transition: null,
    });

    return (
        <Box
            className={`${isDragging ? cmnStyles.zIndexMax : ''} ${tabClasses[index] || ''}`}
            ref={setNodeRef}
            style={{
                // ドラッグ中は透明にするが位置は保持（DragOverlayが代わりに表示される）
                transform: CSS.Transform.toString(transform),
                transition,
                display: 'flex',
                // ドラッグ中は透明にして位置を保持
                opacity: isDragging ? 0 : 1,
                // 位置関連のスタイルは変更しない
                position: 'relative',
                overflow: 'visible',
                clipPath: 'none',
                contain: 'none',
            }}
        >
            <span
                ref={setActivatorNodeRef}
                style={{
                    width: '24px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    flexShrink: 0,
                }}
                {...attributes}
                {...listeners}
            >
                <Handle />
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
                    margin: '0px',
                    color: 'inherit',
                    pointerEvents: isDragging ? 'none' : 'auto',
                    whiteSpace: 'nowrap',
                }}
            />
        </Box>
    );
};