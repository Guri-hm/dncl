import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";
import { blue } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { Operator } from "./Dialog/Operator";
import { OperationEnum } from "../enum";

type DroppableProp = {
    id: string
    name: string
    isDragging: boolean;
    endOfArrayEvent?: any;
    parentIndex?: number
    type?: OperationEnum
};

export const DroppableOperator: FC<DroppableProp> = ({ id, name, isDragging, endOfArrayEvent, type, parentIndex, event }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })

    return (
        <Grid size="auto"
            ref={setNodeRef}
            sx={{
                height: '40px',
                backgroundColor: isOver && isDragging ? blue[700] : (isDragging ? blue[100] : ""),
                paddingLeft: isDragging ? '10px' : 0,
                paddingRight: isDragging ? '10px' : 0,
            }}
        >
            {type &&
                <Operator name={`${name}`} parentIndex={parentIndex} type={type} event={endOfArrayEvent}></Operator>
            }
        </Grid>
    )
}