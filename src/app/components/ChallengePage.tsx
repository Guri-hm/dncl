"use client"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "@/app/components/SortableTree";
import styles from '@/app/components/common.module.css';
import { Challenge, DnclValidationType } from "@/app/types";
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import { useEffect, useState } from "react";
import { Button, Snackbar } from "@mui/material";
import HeaderTitle from "./HeaderTitle";
import { HintButton } from "./HintButton";
import { HowToButton } from "./HowToButton";
import { ConsoleWrapper } from "./ConsoleWrapper";
import { FooterOverlay } from "./FooterOverlay";
import Tip from "./Tip";
import Door from "./Door";
import { Question } from "./Question";
import SuccessDialog from "./SuccessDialog";
import Confetti from 'react-confetti';

interface Props {
    challenge: Challenge;
}

export default function ChallengePage({ challenge }: Props) {
    const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });
    const [items, setItems] = useState(() => challenge.items);
    const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [hintVisible, setHintVisible] = useState(true);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [runResults, setRunResults] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

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

    // if (challenge.answer.length > 0 && !openSuccessDialog) {
    //     runResults.map(result => {
    //         if (result == challenge.answer.join('\n')) {
    //             setOpenSuccessDialog(true);
    //         }
    //     })
    // }

    useEffect(() => {
        const updateDimensions = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };

        updateDimensions(); // 初期値を設定
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);


    return (
        <PageWrapper>
            <Header>
                <HeaderItem>
                    <HeaderTitle />
                </HeaderItem>
            </Header>
            <ContentWrapper>
                <Question>
                    問：{`${challenge.task}`}
                    <Button onClick={() => setOpenSuccessDialog(true)}>aaa</Button>
                </Question>
                <Allotment vertical defaultSizes={[200, 100]}>
                    <Allotment separator={false} defaultSizes={[100, 100]}>
                        <Allotment.Pane>
                            <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
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
