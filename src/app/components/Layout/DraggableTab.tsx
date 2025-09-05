import React, { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface DraggableTabProps {
    tab: {
        id: string;
        label: string;
        type: string;
    };
    isActive: boolean;
    onClick: () => void;
    panelId: string;
    onExtract?: () => void;
    onClose?: () => void;
}

export const DraggableTab: FC<DraggableTabProps> = ({
    tab,
    isActive,
    onClick,
    panelId,
    onExtract,
    onClose
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: tab.id,
        data: {
            type: 'tab',
            tab,
            sourcePanelId: panelId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleExtract = (e: React.MouseEvent) => {
        e.stopPropagation();
        onExtract?.();
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.();
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #1976d2' : '2px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#1976d2' : '#666666',
                fontSize: '14px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                position: 'relative',
                minWidth: '120px',
                userSelect: 'none'
            }}
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            <span style={{ flex: 1, marginRight: '8px' }}>
                {tab.label}
            </span>

            {/* タブアクション */}
            <div style={{ display: 'flex', gap: '4px', opacity: isActive ? 1 : 0.6 }}>
                {/* 取り出しボタン */}
                <IconButton
                    size="small"
                    onClick={handleExtract}
                    sx={{
                        padding: '2px',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
                    }}
                    title="新しいパネルに取り出し"
                >
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                </IconButton>

                {/* 閉じるボタン（コンソール以外） */}
                {tab.type !== 'console' && (
                    <IconButton
                        size="small"
                        onClick={handleClose}
                        sx={{
                            padding: '2px',
                            '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                        }}
                        title="タブを閉じる"
                    >
                        <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                )}
            </div>
        </div>
    );
};

export default DraggableTab;