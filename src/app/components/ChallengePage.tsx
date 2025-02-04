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
import { useState } from "react";
import { Snackbar } from "@mui/material";
import HeaderTitle from "./HeaderTitle";
import { HintButton } from "./HintButton";
import { HowToButton } from "./HowToButton";
import { ConsoleWrapper } from "./ConsoleWrapper";
import { FooterOverlay } from "./FooterOverlay";
import Tip from "./Tip";
import Door from "./Door";
import { Question } from "./Question";
import SuccessDialog from "./SuccessDialog";

interface Props {
    challenge: Challenge;
}

export default function ChallengePage({ challenge }: Props) {

    const [items, setItems] = useState(() => challenge.items);
    const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });
    const [hintVisible, setHintVisible] = useState(true);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [runResults, setRunResults] = useState<string[]>([]);

    const handleCloseSnackBar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleClose = () => {
        setOpenSuccessDialog(false);
    };

    if (challenge.answer.length > 0 && !openSuccessDialog) {
        runResults.map(result => {
            if (result == challenge.answer.join('\n')) {
                setOpenSuccessDialog(true);
            }
        })
    }

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
            <SuccessDialog open={openSuccessDialog} onClose={handleClose} message="問題をクリアしました！" />
            <FooterOverlay>
                <HintButton />
                <HowToButton />
            </FooterOverlay>
        </PageWrapper >
    );
}
