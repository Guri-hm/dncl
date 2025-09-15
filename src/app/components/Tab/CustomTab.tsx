import { FC } from "react";
import { TabItem } from "@/app/types";
import { useSortable } from "@dnd-kit/sortable";
import { Box, Tab, useTheme } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import cmnStyles from '@/app/components/common.module.css';
import { Handle } from "@/app/components/TreeItem/Handle";

interface CustomTabProps {
    item: TabItem;
    children?: React.ReactNode;
    index: number;
    isSelected?: boolean;
    a11yProps: (index: number) => { id: string; 'aria-controls': string };
    onClick: (event: React.SyntheticEvent) => void;
    disabled?: boolean;
}

export const CustomTab: FC<CustomTabProps> = ({ item, a11yProps, index, onClick, isSelected = false, disabled = false }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
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
            className={`${isDragging ? cmnStyles.zIndexMax : ''}`}
            ref={setNodeRef}
            sx={{
                ...(isSelected
                    ? {
                        // color: 'var(--sky-300)',
                        backgroundColor: isDark ? 'var(--slate-800)' : 'var(--stone-50)',
                        color: isDark ? 'var(--sky-300)' : 'var(--blue-600)',

                    }
                    : {
                        color: 'var(--slate-500) !important',
                        backgroundColor: 'rgb(51 65 85 / 0.5) !important',
                        '&:hover': {
                            color: '#fff !important',
                        },
                    }),
            }}
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
                    pointerEvents: isDragging ? 'none' : 'auto',
                    whiteSpace: 'nowrap',
                    color: 'inherit'
                }}
            />
        </Box>
    );
};