"use client"
import { Suspense, lazy } from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/allotment-custom.css";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
import { LayoutConfig } from "@/app/types/layout";
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
import { useTabPreloader } from '@/app/hooks/useTabPreloader';

// 遅延読み込みコンポーネント
const SortableTree = lazy(() => import("@/app/components/SortableTree").then(module => ({ default: module.SortableTree })));
const TabsBoxWrapper = lazy(() => import("@/app/components/Tab").then(module => ({ default: module.TabsBoxWrapper })));
const ConsoleWrapper = lazy(() => import("@/app/components/ConsoleWrapper").then(module => ({ default: module.ConsoleWrapper })));
const LayoutManager = lazy(() => import("@/app/components/Layout/LayoutManager").then(module => ({ default: module.LayoutManager })));

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

const LayoutLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="300px"
    flexDirection="column"
  >
    <CircularProgress size={32} />
    <Box mt={1} fontSize="0.875rem" color="text.secondary">
      レイアウトマネージャーを読み込み中...
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
  const [useNewLayout, setUseNewLayout] = useState(false); // 新レイアウト切り替えフラグ
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm')); // 600px以上
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);

  // タブコンポーネントのプリロード
  useTabPreloader();
  
  // 新しいレイアウト設定
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    panels: [
      {
        id: 'panel-1',
        type: 'tabs',
        position: 'right',
        tabs: [
          { id: 'dncl', label: 'DNCL', type: 'dncl' },
          { id: 'js', label: 'JavaScript', type: 'js' },
          { id: 'python', label: 'Python', type: 'python' },
          { id: 'vba', label: 'VBA', type: 'vba' },
          { id: 'flow', label: 'フローチャート', type: 'flow' },
        ]
      },
      {
        id: 'panel-2',
        type: 'console',
        position: 'bottom',
        tabs: [
          { id: 'console', label: 'コンソール', type: 'console' }
        ]
      }
    ],
    layout: 'vertical'
  });

  const memoizedSetDnclValidation = useCallback(
    (validation: DnclValidationType | null) => setDnclValidation(validation),
    [setDnclValidation]
  );

  const handleSetTabsBoxWrapperVisible = useCallback((visible: boolean) => {
    setTabsBoxWrapperVisible(visible);
  }, []);

  const handleLayoutChange = useCallback((newConfig: LayoutConfig) => {
    setLayoutConfig(newConfig);
    // レイアウト設定をローカルストレージに保存
    try {
      localStorage.setItem('layoutConfig', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save layout config:', error);
    }
  }, []);

  const toggleLayoutMode = useCallback(() => {
    setUseNewLayout(prev => !prev);
    setSnackbar({
      open: true,
      duration: 3000,
      text: useNewLayout ? '従来レイアウトに切り替えました' : '新しいレイアウトに切り替えました'
    });
  }, [useNewLayout]);

  useEffect(() => {
    const storedItems = loadTreeItems();
    if (storedItems) {
      setItems(storedItems);
    }

    // 保存されたレイアウト設定を読み込み
    try {
      const savedLayoutConfig = localStorage.getItem('layoutConfig');
      if (savedLayoutConfig) {
        const parsedConfig = JSON.parse(savedLayoutConfig);
        setLayoutConfig(parsedConfig);
      }
    } catch (error) {
      console.error('Failed to load layout config:', error);
    }

    // 新レイアウトの使用状態を読み込み
    try {
      const savedUseNewLayout = localStorage.getItem('useNewLayout');
      if (savedUseNewLayout !== null) {
        setUseNewLayout(JSON.parse(savedUseNewLayout));
      }
    } catch (error) {
      console.error('Failed to load layout mode:', error);
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

  useEffect(() => {
    // 新レイアウトの使用状態を保存
    try {
      localStorage.setItem('useNewLayout', JSON.stringify(useNewLayout));
    } catch (error) {
      console.error('Failed to save layout mode:', error);
    }
  }, [useNewLayout]);

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
    console.log("LayoutConfig:", layoutConfig);
  };

  const renderDesktopLayout = () => {
    if (useNewLayout) {
      // 新しいレイアウトマネージャーを使用
      return (
        <Allotment vertical defaultSizes={[300, 200]}>
          <Allotment.Pane>
            <Suspense fallback={<TreeLoadingFallback />}>
              <SortableTree
                treeItems={items}
                setTreeItems={handleItemsChange}
                dnclValidation={dnclValidation}
                collapsible
                indicator
                removable
              />
            </Suspense>
          </Allotment.Pane>
          <Allotment.Pane>
            <Suspense fallback={<LayoutLoadingFallback />}>
              <LayoutManager
                treeItems={items}
                layoutConfig={layoutConfig}
                onLayoutChange={handleLayoutChange}
                dnclValidation={dnclValidation}
                setDnclValidation={memoizedSetDnclValidation}
                runResults={runResults}
                setRunResults={setRunResults}
              />
            </Suspense>
          </Allotment.Pane>
        </Allotment>
      );
    } else {
      // 従来のレイアウト
      return (
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
      );
    }
  };

  const renderMobileLayout = () => (
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
  );

  return (
    <PageWrapper>
      <HeaderBar
        leftContent={<HeaderTitle />}
        rightContent={
          <>
            {process.env.NODE_ENV === "development" && (
              <>
                <HeaderButton onClick={handleLogTreeItems}>
                  TreeItemsログ
                </HeaderButton>
                <HeaderButton onClick={toggleLayoutMode}>
                  {useNewLayout ? '従来UI' : '新UI'}
                </HeaderButton>
              </>
            )}
            <HeaderButton onClick={handleSaveItems} endIcon={<SaveIcon />}>
              保存
            </HeaderButton>
            <ThemeToggleButton />
          </>
        }
      />
      <ContentWrapper>
        {isSm ? renderDesktopLayout() : renderMobileLayout()}
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