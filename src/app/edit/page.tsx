"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "../components/SortableTree";
import styles from '@/app/components/editor.module.css';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import { TreeItems } from "../types";
import Image from "next/image";
import Typography from '@mui/material/Typography';
import { ConsoleBox } from "../components/ConsoleBox";

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
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d30943",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      },
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d30753",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      },
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d3853",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      },
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d39853",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      },
      {
        id: "a37c97e2-b605-40bb-acef-3ce352d55953",
        line: "waを表示する",
        children: [],
        lineTokens: [
          "wa"
        ],
        processIndex: 0
      }
    ],
    lineTokens: [
      "和 (n)"
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
    line: "和 (10)",
    children: [],
    lineTokens: [
      "和 (10)"
    ],
    processIndex: 19
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
  padding: '0.5rem', // mt-2
  flex: 'none', // flex-none
  display: 'flex', // flex
  alignItems: 'center', // items-center
}));

export default function Home() {

  const [items, setItems] = React.useState(() => initialItems);

  return (
    <StyledDiv className={`${styles.bgSlate900}`} >
      <StyledHeader>
        <HeaderItem>
          <Image
            aria-hidden
            src="/logo.svg"
            alt="logo"
            width={50}
            height={50}
          />
          <Typography variant="h1" sx={{ fontSize: '1.5rem', color: 'white', fontWeight: 800, padding: 1 }}>
            <ruby style={{ rubyAlign: 'space-around' }}>
              ぎじげんご
              <rp>（</rp><rt>DNCL</rt><rp>）</rp>
            </ruby>
            いじる子
          </Typography>

        </HeaderItem>
      </StyledHeader>
      <Allotment vertical defaultSizes={[200, 100]}>
        <Allotment.Pane>
          <SortableTree treeItems={items} setTreeItems={setItems} collapsible indicator removable ></SortableTree>
        </Allotment.Pane>
        <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16}`}>
          <ConsoleBox treeItems={items}>ここにコードの結果を出力する</ConsoleBox>
        </Allotment.Pane>
      </Allotment >
    </StyledDiv >
  );
}
