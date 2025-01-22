import { TreeItems } from "@/app/types";

export const sampleFuncItems: TreeItems = [
  {
    id: "e7ffd789-7b09-4e8d-861a-f5909313cba6",
    line: "関数 和(n) を",
    children: [
      {
        id: "2a0a8f52-c215-4cd6-8e49-75e021067043",
        line: "wa ← 0",
        children: [],
        lineTokens: [
          "wa",
          "0"
        ],
        processIndex: 1
      },
      {
        id: "804447e3-e7da-4b59-bbaf-07fac45bb665",
        line: "iを1からnまで1ずつ増やしながら，",
        children: [
          {
            id: "fc46a1d1-859e-41d3-aa4b-bb7e7598e597",
            line: "wa ← wa + i",
            children: [],
            lineTokens: [
              "wa",
              "wa + i"
            ],
            processIndex: 1
          }
        ],
        lineTokens: [
          "i",
          "1",
          "n",
          "1"
        ],
        processIndex: 14,
        collapsed: false
      },
      {
        id: "fd2586af-5c4b-471d-9db4-6443544b6e35",
        line: "を繰り返す",
        children: [],
        lineTokens: [
        ],
        processIndex: 16
      },
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d30951",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      },
    ],
    lineTokens: [
      "和(n)"
    ],
    processIndex: 17
  },
  {
    id: "bf8a371f-7366-4e32-9811-0b3e64d987a5",
    line: "と定義する",
    children: [],
    lineTokens: [
    ],
    processIndex: 18
  },
  {
    id: "8ce90945-0ee4-4fc5-a8b7-e974fb4c84d5",
    line: "和(10)",
    children: [],
    lineTokens: [
      "和(10)"
    ],
    processIndex: 19
  }
]