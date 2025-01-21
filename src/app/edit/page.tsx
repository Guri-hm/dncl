"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, FlattenedItem, TreeItems } from "@/app/types";
import Image from "next/image";
import Typography from '@mui/material/Typography';
import { ConsoleBox } from "@/app/components/ConsoleBox";
import { ConsoleTab } from "@/app/components/ConsoleTab";
import { PageWrapper } from "@/app/components/PageWrapper";
import { sampleFuncItems } from "@/app/components/SampleDncl";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useEffect, useState } from "react";
import { checkDNCLSyntax, flattenTree } from "@/app/utilities";
import { TabsBoxWrapper } from "@/app/components/TabsBoxWrapper";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [items, setItems] = useState(() => initialItems);
  const [runResults, setRunResults] = useState<string[]>([]);
  const [shouldRunEffect, setShouldRunEffect] = useState(false);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], guid: 0, lineNum: [] });
  const [tmpMsg, setTmpMsg] = useState<string>('ここに出力結果が表示されます');

  useEffect(() => {

    setTmpMsg('DNCL解析中・・・')

    const timer = setTimeout(() => {
      setShouldRunEffect(true);
    }, 2000); // 2秒後に実行
    return () => clearTimeout(timer); // クリーンアップ
  }, [items]);

  useEffect(() => {
    if (shouldRunEffect) {
      // フラグをリセット
      setShouldRunEffect(false);
      const flatten = flattenTree(items);

      let result: DnclValidationType = { errors: [], hasError: false, guid: Math.random(), lineNum: [] };
      flatten.map((item: FlattenedItem, index) => {
        const { hasError, errors } = checkDNCLSyntax(flatten, item, index + 1);
        if (hasError) {
          result.hasError = true;
          result.errors.push(...errors);
          result.lineNum.push(index + 1);
        }
      })

      //useEffectが変更を検知できるように乱数を使う
      setDnclValidation(result);

    }
  }, [shouldRunEffect]);

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
          <Allotment defaultSizes={[100, 100]}>
            <Allotment>
              <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
            </Allotment>
            <Allotment>
              <TabsBoxWrapper treeItems={items}></TabsBoxWrapper>
            </Allotment>
          </Allotment>

          <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>

            <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
              <ConsoleTab treeItems={items} runResults={runResults} setRunResults={setRunResults} dnclValidation={dnclValidation} tmpMsg={tmpMsg} setTmpMsg={setTmpMsg}></ConsoleTab>
            </ConsoleBox>
          </Allotment.Pane>
        </Allotment >
      </ContentWrapper>
    </PageWrapper >
  );
}
