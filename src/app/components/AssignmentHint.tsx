import { Box } from "@mui/material"
import { SortableTreeItem } from "./TreeItem";
import { FlattenedItem } from "../types";
import { v4 as uuidv4 } from 'uuid'
import { SampleTreeItems } from "./SampleTreeItems";
import { NextImage } from "./NextImage";


const sampleItems: FlattenedItem[] = [
    {
        "id": uuidv4(),
        "line": "a ← \"こんにちは\"",
        "children": [],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "processIndex": 1,
    },
    {
        "id": uuidv4(),
        "line": "aを表示する",
        "children": [],
        "index": 1,
        "parentId": null,
        "depth": 0,
        "processIndex": 0,
    }
]

export const AssignmentHint = () => {

    return (
        <Box >
            <Box>
                <p>変数や配列を使う場合，先行処理で変数や配列に値を代入しておく必要があります。</p>
                <p>次のようにアイテムを並べると，コンソールに「こんにちは」と表示されます。</p>
                <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>
            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', width: '50%' }}>
                <img src={"/assignment.svg"} alt='代入文' style={{ maxWidth: '150px' }}></img>
            </Box>
        </Box>
    )
}