"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "../components/SortableTree";
import styles from './editor.module.css';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';

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

  return (
    <StyledDiv className={`${styles.bgSlate800}`}>
      <StyledHeader>
        <HeaderItem>
          でーえぬしーえる
        </HeaderItem>
      </StyledHeader>
      <Allotment className={`${styles.bgSlate900}`} vertical defaultSizes={[200, 100]}>
        <Allotment.Pane>
          <SortableTree collapsible indicator removable ></SortableTree>
        </Allotment.Pane>
        <Allotment.Pane>
          <>ここにコードの結果を出力する</>
        </Allotment.Pane>
      </Allotment >
    </StyledDiv >
  );
}
