"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/allotment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useCallback, useEffect, useRef, useState } from "react";
import { TabsBoxWrapper } from "@/app/components/Tab";
import { Snackbar } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { useTreeItems, loadTreeItems } from "@/app/hooks";
import { Header, HeaderButton, HeaderItem, HeaderTitle } from '@/app/components/Header';
import { HintButton, HowToButton, Door } from "@/app/components/Tips";
import { ConsoleWrapper } from "@/app/components/ConsoleWrapper";
import { FooterOverlay } from "@/app/components/Footer";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { SwiperTabs } from "@/app/components/Tab";
import { SwiperSlide } from "swiper/react";

export default function Home() {

  const [itemsStrage, setItemsStrage] = useTreeItems([]);
  const [items, setItems] = useState<TreeItems>([]);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType | null>(null);
  const [tabsBoxWrapperVisible, setTabsBoxWrapperVisible] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
  const [runResults, setRunResults] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);
  const memoizedSetDnclValidation = useCallback(
    (validation: DnclValidationType | null) => setDnclValidation(validation),
    [setDnclValidation]
  );
  const handleSetTabsBoxWrapperVisible = useCallback((visible: boolean) => {
    setTabsBoxWrapperVisible(visible);
  }, []);

  useEffect(() => {
    const storedItems = loadTreeItems();
    if (storedItems) {
      setItems(storedItems);
    }
  }, [itemsStrage]);

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

  // 開発環境のみ表示するボタンのハンドラ
  const handleLogTreeItems = () => {
    console.log("TreeItems:", items);
  };


  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
          {process.env.NODE_ENV === "development" && (
            <HeaderButton
              onClick={handleLogTreeItems}
            >
              TreeItemsログ
            </HeaderButton>
          )}
          <HeaderButton onClick={handleSaveItems} endIcon={<SaveIcon />}>保存</HeaderButton>
        </HeaderItem>
      </Header>
      <ContentWrapper>
        {
          isSm ?

            <Allotment vertical defaultSizes={[200, 100]}>
              <Allotment separator={false}>
                <Allotment.Pane>
                  <SortableTree treeItems={items} setTreeItems={handleItemsChange} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
                </Allotment.Pane>
                <Allotment.Pane visible={tabsBoxWrapperVisible}>
                  <TabsBoxWrapper treeItems={items} tabsBoxWrapperVisible={tabsBoxWrapperVisible} setTabsBoxWrapperVisible={handleSetTabsBoxWrapperVisible}></TabsBoxWrapper>
                </Allotment.Pane>
                {tabsBoxWrapperVisible ? '' :
                  <Allotment.Pane minSize={60} maxSize={60} className={styles.paneHover}>
                    <Door setVisible={() => setTabsBoxWrapperVisible(true)} title={"パネルを表示したいですか？"} />
                  </Allotment.Pane>
                }
              </Allotment>
              <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>
                <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={memoizedSetDnclValidation} treeItems={items} runResults={runResults} setRunResults={setRunResults} />
              </Allotment.Pane>
            </Allotment >
            :
            <SwiperTabs labels={['プログラム', 'コンソール', 'その他']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
              <SwiperSlide >
                <SortableTree treeItems={items} setTreeItems={handleItemsChange} dnclValidation={dnclValidation} specialElementsRefs={[specialElementRef1, specialElementRef2]} collapsible indicator removable ></SortableTree>
              </SwiperSlide>
              <SwiperSlide>
                <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={memoizedSetDnclValidation} treeItems={items} runResults={runResults} setRunResults={setRunResults} />
              </SwiperSlide>
              <SwiperSlide>
                <TabsBoxWrapper treeItems={items} tabsBoxWrapperVisible={tabsBoxWrapperVisible} setTabsBoxWrapperVisible={setTabsBoxWrapperVisible}></TabsBoxWrapper>
              </SwiperSlide>
            </SwiperTabs>
        }
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
