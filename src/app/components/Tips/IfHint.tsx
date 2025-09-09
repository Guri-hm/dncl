import { Box } from "@mui/material"
import { FlattenedItem } from "@/app/types";
import { SampleTreeItems } from "@/app/components/Tips";
import Image from "next/image";


const sampleItems: FlattenedItem[] = [
    {
        "id": "a646e24b-7c54-4ff5-b24c-bf207ea8ea66",
        "line": "もしa = 1ならば",
        "children": [
            {
                "id": "038e7a96-95f1-4368-b2be-329887c261b0",
                "line": "b ← 0",
                "children": [],
                "lineTokens": [
                    "b",
                    "0"
                ],
                "processIndex": 1,
                "variables": [
                    "b"
                ],
                "fixed": true

            }
        ],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "lineTokens": [
            "a == 1"
        ],
        "processIndex": 6,
        "variables": [],
        "fixed": true
    },
    {
        "id": "038e7a96-95f1-4368-b2be-329887c261b0",
        "line": "b ← 0",
        "children": [],
        "index": 0,
        "parentId": "a646e24b-7c54-4ff5-b24c-bf207ea8ea66",
        "depth": 1,
        "lineTokens": [
            "b",
            "0"
        ],
        "processIndex": 1,
        "variables": [
            "b"
        ],
        "fixed": true
    },
    {
        "id": "9cf69f3e-82d5-4017-aefd-8c6df349d8f8",
        "line": "を実行する",
        "children": [],
        "index": 1,
        "parentId": null,
        "depth": 0,
        "lineTokens": [],
        "processIndex": 9,
        "variables": [],
        "fixed": true
    }
]
const sampleItems2: FlattenedItem[] = [
    {
        "id": "a646e24b-7c54-4ff5-b24c-bf207ea8ea66",
        "line": "もしa = 1ならば",
        "children": [
            {
                "id": "038e7a96-95f1-4368-b2be-329887c261b0",
                "line": "b ← 0",
                "children": [],
                "lineTokens": [
                    "b",
                    "0"
                ],
                "processIndex": 1,
                "variables": [
                    "b"
                ],
                "fixed": true

            }
        ],
        "index": 0,
        "parentId": null,
        "depth": 0,
        "lineTokens": [
            "a == 1"
        ],
        "processIndex": 6,
        "variables": [],
        "fixed": true
    },
    {
        "id": "038e7a96-95f1-4368-b2be-329887c261b0",
        "line": "b ← 0",
        "children": [],
        "index": 0,
        "parentId": "a646e24b-7c54-4ff5-b24c-bf207ea8ea66",
        "depth": 1,
        "lineTokens": [
            "b",
            "0"
        ],
        "processIndex": 1,
        "variables": [
            "b"
        ],
        "fixed": true
    },
    {
        "id": "80441de2-d8da-44de-9ae3-acef559e64ec",
        "line": "を実行し，そうでなければ",
        "children": [
            {
                "id": "9f064b8e-63ed-4b3d-8026-b2022ef9a086",
                "line": "b ← 1",
                "children": [],
                "lineTokens": [
                    "b",
                    "1"
                ],
                "processIndex": 1,
                "variables": [
                    "b"
                ]
            }
        ],
        "index": 1,
        "parentId": null,
        "depth": 0,
        "lineTokens": [],
        "processIndex": 8,
        "variables": [],
        "fixed": true
    },
    {
        "id": "9f064b8e-63ed-4b3d-8026-b2022ef9a086",
        "line": "b ← 1",
        "children": [],
        "index": 0,
        "parentId": "80441de2-d8da-44de-9ae3-acef559e64ec",
        "depth": 1,
        "lineTokens": [
            "b",
            "1"
        ],
        "processIndex": 1,
        "variables": [
            "b"
        ],
        "fixed": true

    },
    {
        "id": "9cf69f3e-82d5-4017-aefd-8c6df349d8f8",
        "line": "を実行する",
        "children": [],
        "index": 1,
        "parentId": null,
        "depth": 0,
        "lineTokens": [],
        "processIndex": 9,
        "variables": [],
        "fixed": true
    }
]



export const IfHint = () => {

    return (
        <Box >
            <Box>
                <p>条件に応じて処理を変更したい場合，条件分岐文を使用します。</p>
                <p>条件分岐文は次のようにアイテムを並べます。この場合，変数aの値が2である場合のみ，変数bに0が代入されます。</p>
                <SampleTreeItems sampleItems={sampleItems} ></SampleTreeItems>

                <p>処理をまとめ，この時は～，そうでなければ～，というように記述することもできます。</p>
                <SampleTreeItems sampleItems={sampleItems2} ></SampleTreeItems>

                <p>条件分岐文は，最後に「を実行する」が必要であること，分岐ごとの処理にインデント（行の先頭をずらすこと）が必要であること，を忘れないようにしましょう。</p>

            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/if.webp`}
                    alt="表示文"
                    width={300}
                    height={300}
                    style={{ width: "100%", maxWidth: "200px" }}
                />
            </Box>
        </Box>
    )
}