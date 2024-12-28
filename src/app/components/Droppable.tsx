import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mui/material";
import { FC, ReactNode } from "react";
import { lightBlue } from '@mui/material/colors';
import Button from '@mui/material/Button';

type DroppableProp = {
    children: ReactNode;
    id: string
    isDragging: boolean;
    onClick?: any
};

export const Droppable: FC<DroppableProp> = ({ children, id, isDragging, onClick }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })

    //Buttonコンポーネントはmin-widthが64pxに設定されているので明示的に0pxに再設定する
    return (
        <Box
            ref={setNodeRef}
            className={isOver ? "bg-sky-500" : (isDragging ? "bg-sky-200" : "")}
            sx={{
                whiteSpace: 'nowrap',
                display: 'grid',
                height: '40px',
                alignItems: 'center',
                backgroundColor: isOver ? lightBlue[500] : (isDragging ? lightBlue[100] : "")
            }}
        >
            <Button onClick={onClick} size="large" sx={{ paddingLeft: '5px', paddingRight: '5px', minWidth: 0, }}>{children}</Button>
            <input type="hidden" name={id} value={`${children}`} />
        </Box>
    )
}