import { useDraggable } from "@dnd-kit/core";
import { FC } from "react";
import Paper from '@mui/material/Paper';
import { Handle } from "../TreeItem/Handle";

type Props = {
    id: string;
    label: string;
};

export const DraggableRoundBrackets: FC<Props> = ({ id, label }) => {
    const {
        setNodeRef,
        listeners,
        attributes,
    } = useDraggable({
        id
    });

    return (
        <Paper ref={setNodeRef} sx={{ display: 'flex', alignItems: 'center', minWidth: '70px' }}>

            <Handle  {...attributes}{...listeners} ></Handle>
            <span style={{ flexGrow: 1 }}>{label}</span>
        </Paper >
    );
};
