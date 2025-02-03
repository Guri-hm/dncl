import { FC, useState } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox } from "./ConsoleBox";
import { ConsoleTab } from "./ConsoleTab";

interface Props {
    treeItems: TreeItems;
    dnclValidation: DnclValidationType,
    setDnclValidation: any,
}

export const ConsoleWrapper: FC<Props> = ({ treeItems, dnclValidation, setDnclValidation }) => {

    const [runResults, setRunResults] = useState<string[]>([]);

    return (
        <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
            <ConsoleTab treeItems={treeItems} runResults={runResults} setRunResults={setRunResults} dnclValidation={dnclValidation} setDnclValidation={setDnclValidation}></ConsoleTab>
        </ConsoleBox>
    );
};
