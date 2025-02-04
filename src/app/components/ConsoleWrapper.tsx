import { FC, useState } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox } from "./ConsoleBox";
import { ConsoleTab } from "./ConsoleTab";

interface Props {
    treeItems: TreeItems;
    dnclValidation: DnclValidationType,
    setDnclValidation: any,
    answer?: string[],
}

export const ConsoleWrapper: FC<Props> = ({ ...props }) => {

    const [runResults, setRunResults] = useState<string[]>([]);

    return (
        <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
            <ConsoleTab {...props} runResults={runResults} setRunResults={setRunResults}></ConsoleTab>
        </ConsoleBox>
    );
};
