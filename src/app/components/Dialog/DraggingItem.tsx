import { Box } from "@mui/material";

export const DraggingItem = () => {
    return (
        <Box
            sx={{
                background: "red",
                height: "100px",
                width: "100px",
                cursor: "grabbing",
                opacity: ".7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            ドラッグ中
        </Box>
    );
};
