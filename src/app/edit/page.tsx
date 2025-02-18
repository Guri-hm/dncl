"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { DnclValidationType, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { sampleFuncItems } from "@/app/components/SampleDncl";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useEffect, useRef, useState } from "react";
import { TabsBoxWrapper } from "@/app/components/TabsBoxWrapper";
import Button from '@mui/material/Button';
import { Snackbar } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { useTreeItems, loadTreeItems } from "@/app/components/TreeItemsLocalStrage";
import HeaderTitle from "@/app/components/HeaderTitle";
import { HintButton } from "@/app/components/HintButton";
import { HowToButton } from "@/app/components/HowToButton";
import { ConsoleWrapper } from "@/app/components/ConsoleWrapper";
import { FooterOverlay } from "@/app/components/FooterOverlay";
import Door from "@/app/components/Door";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { SwiperTabs } from "@/app/components/SwiperTabs";
import { SwiperSlide } from "swiper/react";

const initialItems: TreeItems = sampleFuncItems;

export default function Home() {

  const [itemsStrage, setItemsStrage] = useTreeItems([]);
  const [items, setItems] = useState(() => loadTreeItems() ? initialItems : initialItems);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
  const [tabsBoxWrapperVisible, setTabsBoxWrapperVisible] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
  const [runResults, setRunResults] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);

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
        {
          isSm ?

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
            :
            <SwiperTabs labels={['プログラム', 'その他']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
              <SwiperSlide >
                <SortableTree treeItems={items} setTreeItems={handleItemsChange} dnclValidation={dnclValidation} specialElementsRefs={[specialElementRef1, specialElementRef2]} collapsible indicator removable ></SortableTree>
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
