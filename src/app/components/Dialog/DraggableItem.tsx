import { useDraggable } from "@dnd-kit/core";
import { FC } from "react";
import Paper from '@mui/material/Paper';
import { Handle } from "../TreeItem/Handle";
import { SxProps, Theme } from '@mui/material';
import { CSSProperties } from 'react';

type Props = {
    id: string;
    value: string | null;
    sx?: SxProps<Theme>;
    cursor?: CSSProperties['cursor'];
};

export const DraggableItem: FC<Props> = ({ id, value, sx, cursor = "grab" }) => {
    const {
        setNodeRef,
        listeners,
        attributes,
    } = useDraggable({
        id
    });

    return (
        <Paper ref={setNodeRef} sx={{ display: 'flex', alignItems: 'center', minWidth: '70px', ...sx }}>

            <Handle cursor={cursor} {...attributes}{...listeners} ></Handle>
            <span style={{ flexGrow: 1 }}>{value}</span>
        </Paper >
    );
};
