"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { TreeItems } from "@/app/types";
import Image from "next/image";
import Typography from '@mui/material/Typography';
import { ConsoleBox } from "@/app/components/ConsoleBox";
import { ConsoleTab } from "../components/ConsoleTab";
import { PageWrapper } from "../components/PageWrapper";
import { sampleFuncItems } from "../components/SampleDncl";
import { Header } from "../components/Header";
import { HeaderItem } from "../components/HeaderItem";
import { ContentWrapper } from "../components/ContentWrapper";
import { useState } from "react";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [items, setItems] = useState(() => initialItems);
  const [runResults, setRunResults] = useState<string[]>([]);

  return (
    <PageWrapper>
      <Header>
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
      </Header>
      <ContentWrapper>
        <Allotment vertical defaultSizes={[200, 100]}>
          <Allotment.Pane>
            <SortableTree treeItems={items} setTreeItems={setItems} collapsible indicator removable ></SortableTree>
          </Allotment.Pane>

          <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>

            <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
              <ConsoleTab treeItems={items} runResults={runResults} setRunResults={setRunResults}></ConsoleTab>
            </ConsoleBox>
            {/* <ConsoleBox treeItems={items}>ここにコードの結果を出力する</ConsoleBox> */}
          </Allotment.Pane>
        </Allotment >
      </ContentWrapper>
    </PageWrapper >
  );
}
