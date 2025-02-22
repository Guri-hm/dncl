import { Box } from "@mui/material"
import { FlattenedItem } from "@/app/types";
import { v4 as uuidv4 } from 'uuid'
import { SampleTreeItems } from "./SampleTreeItems";


const sampleItems: FlattenedItem[] = [
    {
        "id": uuidv4(),
        "line": "a ← \"こんにちは\"",
        "children": [],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "processIndex": 1,
        "fixed": true
    },
    {
        "id": uuidv4(),
        "line": "aを表示する",
        "children": [],
        "index": 1,
        "parentId": null,
        "depth": 0,
        "processIndex": 0,
        "fixed": true
    }
]

export const AssignmentHint = () => {

    return (
        <Box >
            <Box>
                <p>変数や配列を使う場合，先行処理で変数や配列に値を代入しておく必要があります。</p>
                <p>次のようにアイテムを並べると，コンソールに「こんにちは」と表示されます。</p>
                <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>
                <p>変数名や配列名はある程度自由に決められます。ただし，処理の都合で規則が用意されています。規則内でなるべくわかりやすく命名しましょう。</p>
            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/assignment.svg"} alt='代入文' style={{ maxWidth: '150px' }}></img>
            </Box>
        </Box>
    )
}