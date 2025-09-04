import { Dispatch, FC, SetStateAction } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox, ConsoleTab } from '@/app/components/Tab';
import React from 'react';

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
            <ConsoleTab {...props} setRunResults={setRunResults}></ConsoleTab>
        </ConsoleBox>
    );
}, (prevProps, nextProps) => {
    return (
        JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.runResults) === JSON.stringify(nextProps.runResults) &&
        prevProps.dnclValidation === nextProps.dnclValidation
    );
});