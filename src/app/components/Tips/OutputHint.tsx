import { Box } from "@mui/material"
import { FlattenedItem } from "@/app/types";
import { v4 as uuidv4 } from 'uuid'
import { SampleTreeItems } from "@/app/components/Tips";
import ResponsiveImage from "../ResponsiveImage";


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

export const OutputHint = () => {

    return (
        <Box >
            <Box>
                <p>変数や配列の要素がどうなっているかは表示文で確認できます。</p>
                <p>次のようにアイテムを並べると，コンソールに「こんにちは」と表示されます。</p>
                <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>
            </Box>
            <ResponsiveImage
                src={`${process.env.NEXT_PUBLIC_BASE_PATH}/output.svg`}
                alt="メガホンをもつ女の子" maxWidth={200}
            />
        </Box>
    )
}