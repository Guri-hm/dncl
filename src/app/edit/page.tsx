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
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { HowToDialog } from "../components/Dialog";
import { v4 as uuidv4 } from "uuid";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [items, setItems] = useState(() => initialItems);
  const [runResults, setRunResults] = useState<string[]>([]);
  const [shouldRunEffect, setShouldRunEffect] = useState(false);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], guid: uuidv4(), lineNum: [] });
  const [tmpMsg, setTmpMsg] = useState<string>('ここに出力結果が表示されます');
  const [openHowToDialog, setOpenHowToDialog] = useState(false);

  const handleClickOpen = () => {
    setOpenHowToDialog(true);
  };

  const handleClose = () => {
    setOpenHowToDialog(false);
  };

  useEffect(() => {

    setTmpMsg(items.length.toString())
    const timer = setTimeout(() => {
      setShouldRunEffect(true);
    }, 2000); // 2秒後に実行
    return () => clearTimeout(timer); // クリーンアップ
  }, [items]);

  useEffect(() => {
    if (shouldRunEffect) {
      // フラグをリセット
      setShouldRunEffect(false);

      let result: DnclValidationType = { errors: [], hasError: false, guid: uuidv4(), lineNum: [] };
      const flatten = flattenTree(items);
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
      setTmpMsg("実行待ち")

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
        <HeaderItem>
          <Button sx={{ backgroundColor: 'var(--sky-500)', borderRadius: 5, position: 'absolute', right: '10px', bottom: '10px', zIndex: 20 }} variant="contained" onClick={handleClickOpen} startIcon={<HelpOutlineIcon />}>
            使い方
          </Button>
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
        <HowToDialog open={openHowToDialog} setOpen={setOpenHowToDialog}></HowToDialog>
      </ContentWrapper>
    </PageWrapper >
  );
}
