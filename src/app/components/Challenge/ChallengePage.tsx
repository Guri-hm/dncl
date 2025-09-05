"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/allotment-custom.css";
import { defaultFragments } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { Challenge, DnclValidationType, FragmentItems, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { HeaderBar, HeaderTitle } from "@/app/components/Header";
import { HintButton, HowToButton, Door } from "@/app/components/Tips";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useCallback, useEffect, useRef, useState, Suspense, lazy } from "react";
import { Snackbar, Box, CircularProgress } from "@mui/material";
import { FooterOverlay } from "@/app/components/Footer";
import { Question } from "@/app/components/Challenge";
import Confetti from 'react-confetti';
import { useAchievements, storageKey } from '@/app/hooks';
import { statementEnumMap } from "@/app/enum";
import { v4 as uuidv4 } from "uuid";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { ThemeToggleButton } from '@/app/components/Header';

// 重いコンポーネントを遅延読み込み
const SortableTree = lazy(() => import("@/app/components/SortableTree").then(module => ({ default: module.SortableTree })));
const ConsoleWrapper = lazy(() => import("@/app/components/ConsoleWrapper").then(module => ({ default: module.ConsoleWrapper })));
const SwiperTabs = lazy(() => import("@/app/components/Tab").then(module => ({ default: module.SwiperTabs })));
const SwiperSlide = lazy(() => import("swiper/react").then(module => ({ default: module.SwiperSlide })));
const Tip = lazy(() => import("@/app/components/Tips").then(module => ({ default: module.Tip })));
const SuccessDialog = lazy(() => import("@/app/components/Dialog").then(module => ({ default: module.SuccessDialog })));

interface Props {
    challenge: Challenge;
}

// ローディングコンポーネント
const TreeLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress size={24} />
        <Box ml={1}>プログラムエディタを読み込み中...</Box>
    </Box>
);

const ConsoleLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="150px">
        <CircularProgress size={24} />
        <Box ml={1}>コンソールを読み込み中...</Box>
    </Box>
);

const SwiperLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={20} />
        <Box ml={1}>タブを読み込み中...</Box>
    </Box>
);

const TipLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={20} />
        <Box ml={1}>ヒントを読み込み中...</Box>
    </Box>
);

const DialogLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={20} />
    </Box>
);

const getLines = (treeItems: TreeItems): string[] => {
    const lines: string[] = [];

    const traverse = (items: TreeItems) => {
        for (const item of items) {
            lines.push(item.line);
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        }
    }

    traverse(treeItems);
    return lines;
}

const arraysHaveSameElements = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();

    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) {
            return false;
        }
    }

    return true;
}

export const ChallengePage = ({ challenge }: Props) => {
    const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });
    const [items, setItems] = useState(() => challenge.items);
    const [dnclValidation, setDnclValidation] = useState<DnclValidationType | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [hintVisible, setHintVisible] = useState(true);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [runResults, setRunResults] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const { achievements, addAchievement } = useAchievements(storageKey);
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上
    const specialElementRef1 = useRef<HTMLDivElement | null>(null);
    const specialElementRef2 = useRef<HTMLDivElement | null>(null);

    const memoizedSetDnclValidation = useCallback(
        (validation: DnclValidationType | null) => setDnclValidation(validation),
        [setDnclValidation]
    );

    const fragments: FragmentItems = challenge.usableItems ? challenge.usableItems.map((item, index) => ({
        id: uuidv4(),
        line: item,
        children: [],
        index: 0,
        parentId: null,
        depth: 0,
        statementType: statementEnumMap[item]
    }))
        :
        defaultFragments;

    useEffect(() => {
        if (openSuccessDialog) {
            // 紙吹雪を開始
            setTimeout(() => {
                setShowConfetti(true);
            }, 1000); // くす玉のアニメーション後に紙吹雪を開始
        } else {
            // ダイアログが閉じられたら紙吹雪を停止
            setShowConfetti(false);
        }
    }, [openSuccessDialog]);

    const handleCloseSnackBar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleClose = () => {
        setOpenSuccessDialog(false);
    };

    useEffect(() => {
        if (challenge.answer.length > 0) {
            const answerString = challenge.answer.join('\n');
            runResults.map(result => {
                if (result == answerString) {
                    if (challenge.requiredItems) {
                        const lines = getLines(items);
                        const allMatched = challenge.requiredItems.every(item => {
                            return lines.some(line => arraysHaveSameElements(item.line.split(' '), line.split(' ')));
                        });
                        if (!allMatched) {
                            setSnackbar(prev => ({ ...prev, open: true, text: '適切な答えと一致しません' }));
                            return;
                        }
                    }
                    addAchievement(challenge.id, { isAchieved: true });
                    setOpenSuccessDialog(true);
                }
            });
        }
    }, [runResults, addAchievement, challenge.answer, challenge.id, challenge.requiredItems, items, setSnackbar]);

    useEffect(() => {
        const updateDimensions = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    return (
        <PageWrapper>
            <HeaderBar>
                <HeaderTitle />
                <ThemeToggleButton sx={{ marginLeft: "auto" }} />
            </HeaderBar>
            <Divider sx={{ borderColor: 'var(--slategray)' }} />
            <Question>
                問：{`${challenge.task}`}
            </Question>
            <ContentWrapper>
                {isSm ? (
                    <Allotment vertical defaultSizes={[200, 100]}>
                        <Allotment separator={false}>
                            <Allotment.Pane>
                                <Suspense fallback={<TreeLoadingFallback />}>
                                    <SortableTree
                                        treeItems={items}
                                        setTreeItems={setItems}
                                        dnclValidation={dnclValidation}
                                        fragments={fragments}
                                        collapsible
                                        indicator
                                        removable
                                    />
                                </Suspense>
                            </Allotment.Pane>
                            <Allotment.Pane visible={hintVisible}>
                                <Suspense fallback={<TipLoadingFallback />}>
                                    <Tip onClose={() => setHintVisible(false)} hint={challenge.hint} />
                                </Suspense>
                            </Allotment.Pane>
                            <Allotment.Pane visible={!hintVisible} minSize={60} maxSize={60} className={styles.paneHover}>
                                <Door setVisible={() => setHintVisible(true)} title={"ヒントを表示したいですか？"} />
                            </Allotment.Pane>
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
                    <Suspense fallback={<SwiperLoadingFallback />}>
                        <SwiperTabs labels={['プログラム', 'コンソール', 'ヒント']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
                            <Suspense fallback={<TreeLoadingFallback />}>
                                <SwiperSlide>
                                    <SortableTree
                                        treeItems={items}
                                        setTreeItems={setItems}
                                        dnclValidation={dnclValidation}
                                        specialElementsRefs={[specialElementRef1, specialElementRef2]}
                                        collapsible
                                        indicator
                                        removable
                                    />
                                </SwiperSlide>
                            </Suspense>
                            <Suspense fallback={<ConsoleLoadingFallback />}>
                                <SwiperSlide>
                                    <ConsoleWrapper
                                        dnclValidation={dnclValidation}
                                        setDnclValidation={memoizedSetDnclValidation}
                                        treeItems={items}
                                        runResults={runResults}
                                        setRunResults={setRunResults}
                                    />
                                </SwiperSlide>
                            </Suspense>
                            <Suspense fallback={<TipLoadingFallback />}>
                                <SwiperSlide>
                                    <Tip onClose={() => setHintVisible(false)} hint={challenge.hint} open={hintVisible} />
                                </SwiperSlide>
                            </Suspense>
                        </SwiperTabs>
                    </Suspense>
                )}
            </ContentWrapper>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={snackbar.duration}
                open={snackbar.open}
                onClose={handleCloseSnackBar}
                message={snackbar.text}
            />
            {showConfetti && (
                <Confetti
                    width={windowDimension.width}
                    height={windowDimension.height}
                    recycle={false}
                    numberOfPieces={400}
                />
            )}
            <Suspense fallback={<DialogLoadingFallback />}>
                <SuccessDialog open={openSuccessDialog} onClose={handleClose} message="問題をクリアしました！" />
            </Suspense>
            <FooterOverlay>
                <HintButton />
                <HowToButton />
            </FooterOverlay>
        </PageWrapper>
    );
}