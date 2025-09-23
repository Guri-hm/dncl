"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/allotment-custom.css";
import { defaultFragments } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { Challenge, DnclValidationType, FragmentItems, TreeItems, RequiredItem } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { HeaderBar, HeaderButton, HeaderTitle } from "@/app/components/Header";
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
import ResizerHint from '@/app/components/ResizerHint';
import { useRouter } from 'next/navigation'
import { SwiperSlide } from "swiper/react";
import { SwiperTabs } from "@/app/components/Tab";
import { parseAssignment, expressionsAreEquivalent } from "@/app/utilities/utilities";

// 重いコンポーネントを遅延読み込み
const SortableTree = lazy(() => import("@/app/components/SortableTree").then(module => ({ default: module.SortableTree })));
const ConsoleWrapper = lazy(() => import("@/app/components/ConsoleWrapper").then(module => ({ default: module.ConsoleWrapper })));
const Tip = lazy(() => import("@/app/components/Tips").then(module => ({ default: module.Tip })));
const SuccessDialog = lazy(() => import("@/app/components/Dialog").then(module => ({ default: module.SuccessDialog })));

interface Props {
    challenge: Challenge;
}

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

const ChallengePage = ({ challenge }: Props) => {
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
    // このページ表示中に一度でも成功ダイアログを出したかを記録（再表示防止）
    const shownDialogRef = useRef<boolean>(false);
    const lastAnswerRef = useRef<string | null>(null);
    const lastMismatchRef = useRef<string | null>(null);
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
        statementType: statementEnumMap[item],
        maxUsage: challenge.usableItemLimits ? challenge.usableItemLimits[item] : undefined,
        remainingUsage: challenge.usableItemLimits ? challenge.usableItemLimits[item] : undefined,
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

    const itemsSnapshotAtRunRef = useRef<TreeItems>(items);
    useEffect(() => {
        itemsSnapshotAtRunRef.current = items;
        lastMismatchRef.current = null;
        lastAnswerRef.current = null;
        shownDialogRef.current = false;
    }, [items]);

    useEffect(() => {
        // 早期抜け：解答が定義されていない・結果が無い・既にダイアログ出している等
        if (!challenge || !challenge.answer || challenge.answer.length === 0) return;
        if (shownDialogRef.current) return;
        const latest = runResults.length > 0 ? runResults[runResults.length - 1] : null;
        if (!latest) return;

        // スナップショットを使う（runResults が更新された瞬間の items）
        const itemsAtRun = itemsSnapshotAtRunRef.current;
        const lines = getLines(itemsAtRun);

        const answerString = challenge.answer.join('\n');
        const normalizeForCompare = (s: string | null | undefined) => {
            if (!s) return '';
            const ls = String(s).replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
            return ls.join(',');
        };

        if (!(latest === answerString || normalizeForCompare(latest) === normalizeForCompare(answerString))) {
            return;
        }

        // requiredItems チェック（既存ロジックをそのまま使う）
        if (challenge.requiredItems && challenge.requiredItems.length > 0) {
            type LegacyReqShape = { line?: string; lineTokens?: unknown[]; rhs?: string; lhs?: string; variables?: unknown[] };
            const normalizeReq = (req: RequiredItem | LegacyReqShape): { lhs?: string; rhs: string } | null => {
                const r = req as Record<string, unknown>;
                if (typeof r.line === 'string') {
                    const parsed = parseAssignment(r.line);
                    if (parsed) return parsed;
                }
                if (typeof r.rhs === 'string' && r.rhs.trim() !== '') {
                    const lhs = typeof r.lhs === 'string'
                        ? r.lhs
                        : (Array.isArray(r.variables) && r.variables.length > 0 && typeof r.variables[0] === 'string' ? r.variables[0] as string : undefined);
                    return { lhs, rhs: r.rhs.trim() };
                }
                if (Array.isArray(r.lineTokens) && r.lineTokens.length >= 2) {
                    const first = r.lineTokens[0];
                    const rest = r.lineTokens.slice(1).map(t => String(t));
                    if (typeof first === 'string') {
                        return { lhs: first, rhs: rest.join(' ') };
                    }
                }
                if (typeof r.line === 'string' && r.line.trim() !== '') {
                    return { rhs: r.line.trim() };
                }
                return null;
            };

            const allMatched = challenge.requiredItems.every((req: RequiredItem | LegacyReqShape) => {
                const reqNorm = normalizeReq(req);
                if (!reqNorm) return false;
                return lines.some(line => {
                    const candAssign = parseAssignment(line);
                    if (!candAssign) return false;
                    if (reqNorm.lhs && candAssign.lhs !== reqNorm.lhs) return false;
                    return expressionsAreEquivalent(reqNorm.rhs, candAssign.rhs);
                });
            });

            if (!allMatched) {
                const mismatchKey = `${challenge.id}::${answerString}`;
                if (lastMismatchRef.current !== mismatchKey) {
                    lastMismatchRef.current = mismatchKey;
                    setSnackbar(prev => ({ ...prev, open: true, text: '適切な答えと一致しません' }));
                }
                return;
            }
        }

        // prohibitedItems は常にスナップショット基準でチェック
        if (challenge.prohibitedItems && challenge.prohibitedItems.length > 0) {
            const parsedAssigns = lines.map(l => parseAssignment(l)).filter(Boolean) as { lhs?: string; rhs: string }[];
            const prohibitedBaseKey = `${challenge.id}::prohibited`;
            for (const p of challenge.prohibitedItems) {
                const match = parsedAssigns.some(a => {
                    if (p.lhs && a.lhs !== p.lhs) return false;
                    if (p.rhs) return expressionsAreEquivalent(p.rhs, a.rhs);
                    return !!p.lhs;
                });
                if (match) {
                    const violationKey = `${prohibitedBaseKey}::${p.lhs ?? ''}::${p.rhs ?? ''}`;
                    if (lastMismatchRef.current === violationKey) {
                        return;
                    }
                    lastMismatchRef.current = violationKey;
                    setSnackbar(prev => ({ ...prev, open: true, text: '禁止された記述が検出されました' }));
                    return;
                }
            }
        }

        // 正常クリア処理
        shownDialogRef.current = true;
        const alreadyAchieved = !!achievements?.[challenge.id]?.isAchieved;
        if (!alreadyAchieved) {
            addAchievement(challenge.id, { isAchieved: true });
        }
        setOpenSuccessDialog(true);

    }, [runResults, challenge, addAchievement, achievements]);

    useEffect(() => {
        const updateDimensions = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const router = useRouter();
    const handleRedirect = () => {
        router.push('/chlng');
    };

    return (
        <PageWrapper>
            <HeaderBar
                leftContent={<HeaderTitle />}
                rightContent={
                    <>
                        <HeaderButton onClick={handleRedirect} >一覧へ戻る</HeaderButton>
                        <ThemeToggleButton />
                    </>
                }
            />
            <Divider sx={{ borderColor: 'var(--slategray)' }} />
            <Question>
                問：{`${challenge.task}`}
            </Question>
            <ContentWrapper>
                <ResizerHint />
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
                    <SwiperTabs labels={['プログラム', 'コンソール', 'ヒント']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
                        <SwiperSlide>
                            <Suspense fallback={<TreeLoadingFallback />}>
                                <SortableTree
                                    treeItems={items}
                                    setTreeItems={setItems}
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
                            <Suspense fallback={<TipLoadingFallback />}>
                                <Tip onClose={() => setHintVisible(false)} hint={challenge.hint} open={hintVisible} />
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
export default ChallengePage;