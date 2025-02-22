"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "@/app/components/alloment-custom.css";
import { defaultFragments, SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { Challenge, DnclValidationType, FragmentItems, TreeItems } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header, HeaderItem, HeaderTitle } from "@/app/components/Header";
import { HintButton, HowToButton, Tip, Door } from "@/app/components/Tips";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useEffect, useRef, useState } from "react";
import { Snackbar } from "@mui/material";
import { ConsoleWrapper } from "@/app/components/ConsoleWrapper";
import { FooterOverlay } from "@/app/components/Footer";
import { Question } from "@/app/components/Challenge";
import {SuccessDialog} from "@/app/components/Dialog";
import Confetti from 'react-confetti';
import { useAchievements, storageKey } from '@/app/hooks';
import { statementEnumMap } from "@/app/enum";
import { v4 as uuidv4 } from "uuid";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { SwiperTabs } from "@/app/components/Tab";
import { SwiperSlide } from "swiper/react";
import Divider from '@mui/material/Divider';

interface Props {
    challenge: Challenge;
}

const getLines = (treeItems: TreeItems): string[] => {
    let lines: string[] = [];

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
    const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
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
                            setSnackbar({ ...snackbar, open: true, text: '適切な答えと一致しません' });
                            return;
                        }
                    }
                    addAchievement(challenge.id, { isAchieved: true });
                    setOpenSuccessDialog(true);
                }
            })
        }
    }, [runResults]);

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
            <Header>
                <HeaderItem>
                    <HeaderTitle />
                </HeaderItem>
                <Divider sx={{ borderColor: 'var(--slategray)' }} />
                <Question>
                    問：{`${challenge.task}`}
                </Question>
            </Header>
            <ContentWrapper>
                {isSm ?
                    <Allotment vertical defaultSizes={[200, 100]}>
                        <Allotment separator={false} defaultSizes={[100, 100]}>
                            <Allotment.Pane>
                                <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} fragments={fragments} collapsible indicator removable ></SortableTree>
                            </Allotment.Pane>
                            <Allotment.Pane visible={hintVisible}>
                                <Tip onClose={() => setHintVisible(false)} hint={challenge.hint} />
                            </Allotment.Pane>
                            <Allotment.Pane visible={!hintVisible} minSize={60} maxSize={60} className={styles.paneHover}>
                                <Door setVisible={() => setHintVisible(true)} title={"ヒントを表示したいですか？"} />
                            </Allotment.Pane>
                        </Allotment>
                        <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>
                            <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={setDnclValidation} treeItems={items} runResults={runResults} setRunResults={setRunResults} />
                        </Allotment.Pane>
                    </Allotment >
                    :
                    <SwiperTabs labels={['プログラム', 'コンソール', 'ヒント']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
                        <SwiperSlide >
                            <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} specialElementsRefs={[specialElementRef1, specialElementRef2]} collapsible indicator removable ></SortableTree>
                        </SwiperSlide>
                        <SwiperSlide>
                            <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={setDnclValidation} treeItems={items} runResults={runResults} setRunResults={setRunResults} />
                        </SwiperSlide>
                        <SwiperSlide>
                            <Tip onClose={() => setHintVisible(false)} hint={challenge.hint} open={hintVisible} />
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
            {showConfetti && (
                <Confetti
                    width={windowDimension.width}
                    height={windowDimension.height}
                    recycle={false}
                    numberOfPieces={400}
                />
            )}
            <SuccessDialog open={openSuccessDialog} onClose={handleClose} message="問題をクリアしました！" />
            <FooterOverlay>
                <HintButton />
                <HowToButton />
            </FooterOverlay>
        </PageWrapper >
    );
}
