"use client"
import { Suspense, lazy } from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/allotment-custom.css";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useCallback, useEffect, useRef, useState } from "react";
import { Snackbar, Box, CircularProgress } from "@mui/material";
import { useTreeItems, loadTreeItems } from "@/app/hooks";
import { HeaderButton, HeaderBar, HeaderTitle } from '@/app/components/Header';
import { HintButton, HowToButton, Door } from "@/app/components/Tips";
import { FooterOverlay } from "@/app/components/Footer";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { SwiperTabs } from "@/app/components/Tab";
import { SwiperSlide } from "swiper/react";
import { ThemeToggleButton } from '@/app/components/Header';
import SaveIcon from '@mui/icons-material/Save';

// 遅延読み込みコンポーネント（実際に存在するもののみ）
const SortableTree = lazy(() => import("@/app/components/SortableTree").then(module => ({ default: module.SortableTree })));
const TabsBoxWrapper = lazy(() => import("@/app/components/Tab").then(module => ({ default: module.TabsBoxWrapper })));
const ConsoleWrapper = lazy(() => import("@/app/components/ConsoleWrapper").then(module => ({ default: module.ConsoleWrapper })));

// ローディングコンポーネント
const TreeLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="200px"
    flexDirection="column"
  >
    <CircularProgress size={24} />
    <Box mt={1} fontSize="0.875rem" color="text.secondary">
      プログラムエディタを読み込み中...
    </Box>
  </Box>
);

const TabsLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="200px"
    flexDirection="column"
  >
    <CircularProgress size={24} />
    <Box mt={1} fontSize="0.875rem" color="text.secondary">
      コード変換パネルを読み込み中...
    </Box>
  </Box>
);

const ConsoleLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="150px"
    flexDirection="column"
  >
    <CircularProgress size={24} />
    <Box mt={1} fontSize="0.875rem" color="text.secondary">
      コンソールを読み込み中...
    </Box>
  </Box>
);

export default function Home() {
  const [itemsStrage, setItemsStrage] = useTreeItems([]);
  const [items, setItems] = useState<TreeItems>([]);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType | null>(null);
  const [tabsBoxWrapperVisible, setTabsBoxWrapperVisible] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
  const [runResults, setRunResults] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm')); // 600px以上
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
      <HeaderBar
        leftContent={<HeaderTitle />}
        rightContent={
          <>
            {process.env.NODE_ENV === "development" && (
              <HeaderButton onClick={handleLogTreeItems}>TreeItemsログ</HeaderButton>
            )}
            <HeaderButton onClick={handleSaveItems} endIcon={<SaveIcon />}>保存</HeaderButton>
            <ThemeToggleButton />
          </>
        }
      />
      <ContentWrapper>
        {isSm ? (
          <Allotment vertical defaultSizes={[200, 100]}>
            <Allotment separator={false}>
              <Allotment.Pane>
                <Suspense fallback={<TreeLoadingFallback />}>
                  <SortableTree
                    treeItems={items}
                    setTreeItems={handleItemsChange}
                    dnclValidation={dnclValidation}
                    collapsible
                    indicator
                    removable
                    allowEdit={true}
                  />
                </Suspense>
              </Allotment.Pane>
              <Allotment.Pane visible={tabsBoxWrapperVisible}>
                <Suspense fallback={<TabsLoadingFallback />}>
                  <TabsBoxWrapper
                    treeItems={items}
                    tabsBoxWrapperVisible={tabsBoxWrapperVisible}
                    setTabsBoxWrapperVisible={handleSetTabsBoxWrapperVisible}
                  />
                </Suspense>
              </Allotment.Pane>
              {tabsBoxWrapperVisible ? '' : (
                <Allotment.Pane minSize={60} maxSize={60} className={styles.paneHover}>
                  <Door setVisible={() => setTabsBoxWrapperVisible(true)} title={"パネルを表示したいですか？"} />
                </Allotment.Pane>
              )}
            </Allotment>
            <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull}`}>
              <Suspense fallback={<ConsoleLoadingFallback />}>
                <ConsoleWrapper
                  dnclValidation={dnclValidation}
                  setDnclValidation={memoizedSetDnclValidation}
                  treeItems={items}
                  runResults={runResults}
                  setRunResults={setRunResults}
                />
              </Suspense>
            </Allotment.Pane>
          </Allotment>
        ) : (
          <SwiperTabs labels={['プログラム', 'コンソール', 'その他']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
            <SwiperSlide>
              <Suspense fallback={<TreeLoadingFallback />}>
                <SortableTree
                  treeItems={items}
                  setTreeItems={handleItemsChange}
                  dnclValidation={dnclValidation}
                  specialElementsRefs={[specialElementRef1, specialElementRef2]}
                  collapsible
                  indicator
                  removable
                  allowEdit={true}
                />
              </Suspense>
            </SwiperSlide>
            <SwiperSlide>
              <Suspense fallback={<ConsoleLoadingFallback />}>
                <ConsoleWrapper
                  dnclValidation={dnclValidation}
                  setDnclValidation={memoizedSetDnclValidation}
                  treeItems={items}
                  runResults={runResults}
                  setRunResults={setRunResults}
                />
              </Suspense>
            </SwiperSlide>
            <SwiperSlide>
              <Suspense fallback={<TabsLoadingFallback />}>
                <TabsBoxWrapper
                  treeItems={items}
                  tabsBoxWrapperVisible={tabsBoxWrapperVisible}
                  setTabsBoxWrapperVisible={setTabsBoxWrapperVisible}
                />
              </Suspense>
            </SwiperSlide>
          </SwiperTabs>
        )}
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
    </PageWrapper>
  );
}