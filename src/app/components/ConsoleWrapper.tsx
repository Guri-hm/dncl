import { FC } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox, ConsoleTab } from '@/app/components/Tab';

interface Props {
    treeItems: TreeItems;
    dnclValidation: DnclValidationType,
    setDnclValidation: any,
    runResults: string[];
    setRunResults: any;
}

export const ConsoleWrapper: FC<Props> = ({ setRunResults, ...props }) => {
    return (
        <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
            <ConsoleTab {...props} setRunResults={setRunResults}></ConsoleTab>
        </ConsoleBox>
    );
};
