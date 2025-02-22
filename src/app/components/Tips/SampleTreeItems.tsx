import { Box } from "@mui/material";
import { FlattenedItem } from "@/app/types";
import { SortableTreeItem } from "@/app/components/TreeItem";

const indentationWidth = 30;

interface Props {
    sampleItems: FlattenedItem[];
}

export const SampleTreeItems = ({ sampleItems }: Props) => {
    return (
        <Box sx={{ width: '90%', marginX: 'auto', marginY: '10px' }}>
            {
                sampleItems.map(({ id, depth, line, fixed }, index) => (
                    <SortableTreeItem
                        key={id}
                        id={id}
                        value={line}
                        depth={depth}
                        indentationWidth={indentationWidth}
                        fixed={fixed}
                    />
                ))
            }
        </Box>
    )
}