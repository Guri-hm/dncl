import { Dispatch, FC, SetStateAction, Suspense, lazy } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox } from '@/app/components/Tab';
import { Box, CircularProgress } from '@mui/material';
import React from 'react';

// 遅延読み込み
const ConsoleTab = lazy(() => import('./Tab/ConsoleTab').then(module => ({ default: module.ConsoleTab })));

const ConsoleLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={20} />
        <Box ml={1}>コンソールを読み込み中...</Box>
    </Box>
);

interface Props {
    treeItems: TreeItems;
    dnclValidation: DnclValidationType | null,
    setDnclValidation: (validation: DnclValidationType | null) => void;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const ConsoleWrapper: FC<Props> = React.memo(({ setRunResults, ...props }) => {
    return (
        <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
            <Suspense fallback={<ConsoleLoadingFallback />}>
                <ConsoleTab {...props} setRunResults={setRunResults} />
            </Suspense>
        </ConsoleBox>
    );
}, (prevProps, nextProps) => {
    return (
        JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.runResults) === JSON.stringify(nextProps.runResults) &&
        prevProps.dnclValidation === nextProps.dnclValidation
    );
});