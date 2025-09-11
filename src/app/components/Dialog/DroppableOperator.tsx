import { useDroppable } from "@dnd-kit/core";
import { FC } from "react";
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import { Operator } from '@/app/components/Dialog';
import { OperationEnum } from "@/app/enum";

type DroppableProp = {
    id: string
    name: string
    isDragging: boolean;
    endOfArrayEvent?: () => void;
    parentIndex?: number
    operatorDefaultIndex?: number
    type?: OperationEnum
};

export const DroppableOperator: FC<DroppableProp> = ({ id, name, isDragging, endOfArrayEvent, type, parentIndex, operatorDefaultIndex }) => {
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
                <Operator name={`${name}`} parentIndex={parentIndex} operatorDefaultIndex={operatorDefaultIndex} type={type} event={endOfArrayEvent}></Operator>
            }
        </Grid>
    )
}