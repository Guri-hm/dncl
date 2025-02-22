import { Box } from "@mui/material"
import { FlattenedItem } from "@/app/types";
import { v4 as uuidv4 } from 'uuid'
import { SampleTreeItems } from "@/app/components/Tips";
import { FC } from "react";

const sampleItems: FlattenedItem[] = [
    {
        "id": uuidv4(),
        "line": "ninzuu ← 2",
        "children": [],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "processIndex": 1,
        "fixed": true
    },
]

export const VariableHint: FC = () => {

    return (
        <Box>
            <p>変数は，数値や文字列を入れる名前付きの「箱」に例えられます。中身は入れ替え可能です。</p>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/box.svg"} alt='箱' style={{ maxWidth: '150px' }}></img>
            </Box>
            <p>規則はありますが，変数の名前は自由に決められます。名前を見て，どのような数値や文字列か入っているかがわかるように名づけましょう。</p>
            <p>変数に数値や文字列を入れることを「代入」と言います。DNCLでは次のように書きます。</p>

            <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>

            <p>なお，変数は数値や文字列などにつける「ラベル」にも例えられます。「箱」と「ラベル」のどちらがよい例えかは，ここでは言及しません。</p>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/label.svg"} alt='ラベル' style={{ maxWidth: '150px' }}></img>
            </Box>
            <p>変数は数値や文字列などにつける「ラベル」にも例えられます。「箱」と「ラベル」のどちらがよい例えかは，ここでは言及しません。</p>

        </Box>
    )
}