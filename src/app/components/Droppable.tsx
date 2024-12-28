import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mui/material";
import { FC, ReactNode } from "react";
import { lightBlue } from '@mui/material/colors';

type DroppableProp = {
    children: ReactNode;
    id: string
    isDragging: boolean;
};

export const Droppable: FC<DroppableProp> = ({ children, id, isDragging }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })

    return (
        <Box
            ref={setNodeRef}
            className={isOver ? "bg-sky-500" : (isDragging ? "bg-sky-200" : "")}
            sx={{
                display: 'grid',
                height: '40px',
                alignItems: 'center',
                backgroundColor: isOver ? lightBlue[500] : (isDragging ? lightBlue[100] : "")
            }}
        >
            {children}
            <input type="hidden" name={id} value={"children"} />
        </Box>
    )
}