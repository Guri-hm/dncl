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
import { Snackbar } from "@mui/material";
import HeaderTitle from "./HeaderTitle";
import { HintButton } from "./HintButton";
import { HowToButton } from "./HowToButton";
import { ConsoleWrapper } from "./ConsoleWrapper";
import { FooterOverlay } from "./FooterOverlay";
import DoNotDrag from "./DoNotDrag";
import DropHere from "./DropHere";

interface Props {
    initialItems: TreeItems;
}

export default function ChallengePage({ initialItems }: Props) {

    const [items, setItems] = useState(() => initialItems);
    const [dnclValidation, setDnclValidation] = useState<DnclValidationType>({ hasError: false, errors: [], lineNum: [] });
    const [snackbar, setSnackbar] = useState<{ open: boolean, duration: number, text: string }>({ open: false, duration: 3000, text: '' });

    const handleCloseSnackBar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <PageWrapper>
            <Header>
                <HeaderItem>
                    <HeaderTitle />
                </HeaderItem>
            </Header>
            <ContentWrapper>
                <Allotment vertical defaultSizes={[200, 100]}>
                    <Allotment separator={false}>
                        <Allotment.Pane>
                            <SortableTree treeItems={items} setTreeItems={setItems} dnclValidation={dnclValidation} collapsible indicator removable ></SortableTree>
                        </Allotment.Pane>
                        <Allotment.Pane>

                            <DropHere />

                        </Allotment.Pane>
                    </Allotment>
                    <Allotment.Pane className={`${styles.bgStone50} ${styles.marginTop16} ${styles.hFull} `}>
                        <ConsoleWrapper dnclValidation={dnclValidation} setDnclValidation={setDnclValidation} treeItems={items} />
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
