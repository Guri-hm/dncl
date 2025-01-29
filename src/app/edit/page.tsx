"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
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
import { TabsBoxWrapper } from "@/app/components/TabsBoxWrapper";
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { HowToDialog } from "../components/Dialog";
import { NextImage } from "../components/NextImage";
import { Snackbar, Tooltip } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { useTreeItems, loadTreeItems } from "@/app/components/TreeItemsLocalStrage";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [itemsStrage, setItemsStrage] = useTreeItems([]);
  const [items, setItems] = useState(() => initialItems);
  // const [items, setItems] = useState(() => initialItems);
  const [runResults, setRunResults] = useState<string[]>([]);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
  const [tmpMsg, setTmpMsg] = useState<string>('ここに出力結果が表示されます');
  const [openHowToDialog, setOpenHowToDialog] = useState(false);
  const [tabsBoxWrapperVisible, setTabsBoxWrapperVisible] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

  useEffect(() => {
    const stragedItems: TreeItems | null = loadTreeItems();
    if (stragedItems) {
      setItems(stragedItems);
    }
  }, []);

  const handleClickOpen = () => {
    setOpenHowToDialog(true);
  };

  const handleClose = () => {
    setOpenHowToDialog(false);
  };
  const handleCloseSnackBar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleShowTabsBoxWrapper = () => {
    setTabsBoxWrapperVisible(true);
  };
  const handleSaveItems = () => {
    setItemsStrage(items);
    setSnackbar({ ...snackbar, open: true, text: 'リストを保存しました' });
  }
  const handleLoadItems = () => {
    const stragedItems: TreeItems | null = loadTreeItems();

    if (stragedItems == null) {
      console.log("ストレージなし")
      return;
    }

    console.log("ストレージあり")
    setSnackbar({ ...snackbar, open: true, text: 'リストを読み込みました' });
  }

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
          <Button sx={{ backgroundColor: 'var(--sky-500)', borderRadius: 5, position: 'absolute', right: '10px', bottom: '10px', zIndex: 20 }} variant="contained" onClick={handleClickOpen} startIcon={<HelpOutlineIcon />}>
            使い方
          </Button>
          <Button
            sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
            onClick={handleSaveItems}
            endIcon={<SaveIcon />}
            variant="contained"
          >
            保存
          </Button>
        </HeaderItem>
      </Header>
      <ContentWrapper>
        <Allotment vertical defaultSizes={[200, 100]}>
          <Allotment>
            <Allotment.Pane>
              <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
            </Allotment.Pane>
            <Allotment.Pane visible={tabsBoxWrapperVisible}>
              <TabsBoxWrapper treeItems={items} tabsBoxWrapperVisible={tabsBoxWrapperVisible} setTabsBoxWrapperVisible={setTabsBoxWrapperVisible}></TabsBoxWrapper>
            </Allotment.Pane>
            {tabsBoxWrapperVisible ? '' :
              <Allotment.Pane minSize={60} maxSize={60} className={styles.paneHover}>
                <Tooltip title="パネルを表示したいですか？" arrow followCursor placement="left">
                  <span onClick={handleShowTabsBoxWrapper} >
                    <NextImage src={"/door.svg"} alt={'ドアから覗く'} objectFit="cover" />
                  </span>
                </Tooltip>
              </Allotment.Pane>
            }
          </Allotment>

          <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>

            <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
              <ConsoleTab treeItems={items} runResults={runResults} setRunResults={setRunResults} dnclValidation={dnclValidation} setDnclValidation={setDnclValidation} tmpMsg={tmpMsg} setTmpMsg={setTmpMsg}></ConsoleTab>
            </ConsoleBox>
          </Allotment.Pane>
        </Allotment >
        <HowToDialog open={openHowToDialog} setOpen={setOpenHowToDialog}></HowToDialog>
      </ContentWrapper>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={snackbar.duration}
        open={snackbar.open}
        onClose={handleCloseSnackBar}
        message={snackbar.text}
      />
    </PageWrapper >
  );
}
