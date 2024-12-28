import { useDroppable } from "@dnd-kit/core";
import { Box, Stack, Typography } from "@mui/material";
import { FC, ReactNode } from "react";

type DroppableProp = {
    id: string;
    children: ReactNode;
};

export const Droppable: FC<DroppableProp> = ({ children, id }) => {
    const { setNodeRef, isOver } = useDroppable({
        id
    });
    return (
        <Box
            ref={setNodeRef}
            sx={{
                width: "200px",
                bgcolor: isOver ? "lightGreen" : undefined,
                minHeight: "300px",
                overflowX: "auto",
                padding: 2,
                border: "1px solid black"
            }}
        >
            <Stack spacing={2}>
                <Typography sx={{ fontWeight: "bold" }}>ドロップエリア</Typography>
                {children}
            </Stack>
        </Box>
    );
};
