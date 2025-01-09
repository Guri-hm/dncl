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
    id: "e7ffd789-7b09-4e8d-861a-f5909313cba6",
    line: "関数 和 (n) を",
    children: [
      {
        id: "2a0a8f52-c215-4cd6-8e49-75e021067043",
        line: "wa ← 0",
        children: [],
        lineTokens: [
          "wa",
          "←",
          "0"
        ],
        processIndex: 1
      }
    ],
    lineTokens: [
      "和 (n)"
    ],
    processIndex: 17
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
          疑似言語いじる子
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
