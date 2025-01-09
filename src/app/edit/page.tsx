"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "../components/SortableTree";
import styles from './editor.module.css';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import { TreeItems } from "../types";
import { getEnumIndex } from "../utilities";
import { ProcessEnum } from "@/app/enum";


const initialItems: TreeItems = [
  {
    id: "8b5c6537-316a-4ceb-805d-9be78119cf9f",
    code: "関数 和 (n) を",
    processIndex: getEnumIndex(ProcessEnum, ProcessEnum.DefineFunction),
    children: [
      {
        id: "a71d23f6-6b6c-4c92-98e1-4a3924becf31",
        code: "wa ← 0",
        children: [],
        processIndex: getEnumIndex(ProcessEnum, ProcessEnum.SetValToVariableOrArray),
      },
      {
        id: "19cbcd83-88b8-4f57-8c37-e5fa13b71dff",
        code: "i を1からnまで1ずつ増やしながら，",
        children: [
          {
            id: "39cd38d7-994d-4ef5-861f-113008fbbf0b",
            code: "wa ← wa + 1",
            children: [],
            processIndex: getEnumIndex(ProcessEnum, ProcessEnum.SetValToVariableOrArray),
          }
        ],
        processIndex: getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement),
      },
      {
        id: "7622a456-9e1b-4eb0-9487-38964d88ae01",
        code: "を繰り返す",
        children: [],
        processIndex: getEnumIndex(ProcessEnum, ProcessEnum.EndFor),
      },
      {
        id: "b68327e6-ab0b-4756-b7d6-e933a56366d4",
        code: "waを表示する",
        children: [],
        processIndex: getEnumIndex(ProcessEnum, ProcessEnum.Output),
      }
    ],
  },
  {
    id: "e523d1a8-eaf7-4d47-81f0-2719da92b514",
    code: "と定義する",
    children: [],
    processIndex: getEnumIndex(ProcessEnum, ProcessEnum.Defined),
  },
  {
    id: "d87e4fb7-0b0e-40e2-9961-c825db8bb3f0",
    code: "和 (10)",
    children: [],
    processIndex: getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction),
  }
]

const StyledDiv = styled(Box)(({ theme }) => ({
  width: '100%', // w-full
  borderStyle: 'solid', // border-solid
  borderWidth: '2px', // border-2
  height: '100vh', // h-dvh (depending on the parent element or viewport height)
  borderRadius: '0.75rem', // rounded-xl
  overflow: 'hidden', // overflow-hidden
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  position: 'relative', // relative
  display: 'flex', // flex
  color: '#94a3b8', // text-slate-400
  fontSize: '0.75rem', // text-xs
  lineHeight: '1.5rem', // leading-6
}));

const HeaderItem = styled(Box)(({ theme }) => ({
  marginTop: '0.5rem', // mt-2
  flex: 'none', // flex-none
  color: '#38bdf8', // text-sky-300
  paddingX: '1rem', // px-4
  paddingY: '0.25rem', // py-1
  display: 'flex', // flex
  alignItems: 'center', // items-center
}));

export default function Home() {

  const [items, setItems] = React.useState(() => initialItems);

  return (
    <StyledDiv className={`${styles.bgSlate900}`}>
      <StyledHeader>
        <HeaderItem>
          でーえぬしーえる
        </HeaderItem>
      </StyledHeader>
      <Allotment vertical defaultSizes={[200, 100]}>
        <Allotment.Pane>
          <SortableTree treeItems={items} setTreeItems={setItems} collapsible indicator removable ></SortableTree>
        </Allotment.Pane>
        <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16}`}>
          <Box sx={{ margin: '8px' }}>ここにコードの結果を出力する</Box>
        </Allotment.Pane>
      </Allotment >
    </StyledDiv >
  );
}
