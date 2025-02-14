"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { sampleFuncItems } from "@/app/components/SampleDncl";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useEffect, useState } from "react";
import { TabsBoxWrapper } from "@/app/components/TabsBoxWrapper";
import Button from '@mui/material/Button';
import { NextImage } from "../components/NextImage";
import { Snackbar } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { useTreeItems, loadTreeItems } from "@/app/components/TreeItemsLocalStrage";
import { CustomTooltip } from "../components/CustomTooltip";
import HeaderTitle from "../components/HeaderTitle";
import { HintButton } from "../components/HintButton";
import { HowToButton } from "../components/HowToButton";
import { ConsoleWrapper } from "../components/ConsoleWrapper";
import { FooterOverlay } from "../components/FooterOverlay";
import Door from "../components/Door";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [itemsStrage, setItemsStrage] = useTreeItems([]);
  const [items, setItems] = useState(() => loadTreeItems() ? initialItems : initialItems);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
  const [tabsBoxWrapperVisible, setTabsBoxWrapperVisible] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
  const [runResults, setRunResults] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // useEffect(() => {
  //   const stragedItems: TreeItems | null = loadTreeItems();
  //   if (stragedItems) {
  //     setItems(stragedItems);
  //   }
  // }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleCloseSnackBar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleSaveItems = () => {
    setItemsStrage(items);
    setSnackbar({ ...snackbar, open: true, text: 'リストを保存しました' });
    setHasUnsavedChanges(false);
  };
  const handleItemsChange = (newItems: TreeItems) => {
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
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
          <Allotment separator={false}>
            <Allotment.Pane>
              <SortableTree treeItems={items} setTreeItems={handleItemsChange} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
            </Allotment.Pane>
            <Allotment.Pane visible={tabsBoxWrapperVisible}>
              <TabsBoxWrapper treeItems={items} tabsBoxWrapperVisible={tabsBoxWrapperVisible} setTabsBoxWrapperVisible={setTabsBoxWrapperVisible}></TabsBoxWrapper>
            </Allotment.Pane>
            {tabsBoxWrapperVisible ? '' :
              <Allotment.Pane minSize={60} maxSize={60} className={styles.paneHover}>
                <Door setVisible={() => setTabsBoxWrapperVisible(true)} title={"パネルを表示したいですか？"} />
              </Allotment.Pane>
            }
          </Allotment>
          <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>
            <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={setDnclValidation} treeItems={items} runResults={runResults} setRunResults={setRunResults} />
          </Allotment.Pane>
        </Allotment >
      </ContentWrapper>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={snackbar.duration}
        open={snackbar.open}
        onClose={handleCloseSnackBar}
        message={snackbar.text}
      />
      <FooterOverlay>
        <HintButton />
        <HowToButton />
      </FooterOverlay>
    </PageWrapper >
  );
}
