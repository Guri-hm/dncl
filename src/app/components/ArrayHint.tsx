import { Box } from "@mui/material"
import { FlattenedItem } from "../types";
import { v4 as uuidv4 } from 'uuid'
import { SampleTreeItems } from "./SampleTreeItems";


const initiarized: FlattenedItem[] = [
    {
        "id": uuidv4(),
        "line": "seito ← [\"一太郎\" , \"花子\" , \"三四郎\"]",
        "children": [],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "processIndex": 1,
        "fixed": true
    },
]
const sampleItems: FlattenedItem[] = [
    {
        "id": uuidv4(),
        "line": "seito[1]",
        "children": [],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "processIndex": 1,
        "fixed": true
    },
]

export const ArrayHint = () => {

    return (
        <Box>
            <p>配列は，変数をいくつも集めて１つの名前をつけたものです。箱が順番に並んでいるイメージです。</p>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/array.svg"} alt='配列' style={{ maxWidth: '150px' }}></img>
            </Box>

            <p>DNCLでは次のように配列を用意します。この処理を「初期化」と呼びます。</p>
            <SampleTreeItems sampleItems={initiarized} ></SampleTreeItems>

            <p>箱にあたる１つ１つの変数は要素と呼ばれます。特定の要素を指すときは，配列名と箱の番号を使います。この番号は添字と呼ばれます。添字は0からカウントする場合と，1からカウントする場合があります。</p>
            <p>添字を0からカウントする場合，次のように配列名と添字を書くと，配列の中から「花子」を指定したことになります。</p>

            <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>

            <p>余談ですが，配列の例えにはマンションが使われることもあります。要素はマンションの各部屋，添字は部屋番号です。</p>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/apartment.webp"} alt='配列の例え' style={{ maxWidth: '150px' }}></img>
            </Box>
        </Box>
    )
}