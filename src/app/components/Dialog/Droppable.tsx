import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";
import { blue } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';

type DroppableProp = {
    children: ReactNode;
    id: string
    isDragging: boolean;
    onClick?: () => void;
    stringArray?: string[];
};

export const Droppable: FC<DroppableProp> = ({ children, id, isDragging, onClick, stringArray = [] }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })
    //Buttonコンポーネントはmin-widthが64pxに設定されているので明示的に0pxに再設定する
    return (
        <Grid size="auto"
            ref={setNodeRef}
            sx={{
                whiteSpace: 'nowrap',
                display: 'grid',
                height: '40px',
                alignItems: 'center',
                backgroundColor: isOver && isDragging ? blue[700] : (isDragging ? blue[100] : ""),
                paddingLeft: isDragging ? '10px' : 0,
                paddingRight: isDragging ? '10px' : 0,
            }}
        >
            <Button onClick={onClick} size="large" sx={{ paddingLeft: isDragging || stringArray.length > 0 ? '8px' : 0, paddingRight: isDragging || stringArray.length > 0 ? '8px' : 0, minWidth: 0, fontWeight: 700 }}>{children}</Button>
            <input type="hidden" name={id} value={`${stringArray.join(' ')}`} />
        </Grid>
    )
}