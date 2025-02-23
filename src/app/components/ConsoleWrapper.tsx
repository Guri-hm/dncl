import { Dispatch, FC, SetStateAction } from "react";
import { DnclValidationType, TreeItems } from "@/app/types";
import { ConsoleBox, ConsoleTab } from '@/app/components/Tab';

interface Props {
    treeItems: TreeItems;
    dnclValidation: DnclValidationType|null,
    setDnclValidation: (validation: DnclValidationType | null) => void;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const ConsoleWrapper: FC<Props> = ({ setRunResults, ...props }) => {
    return (
        <ConsoleBox tabLabels={['コンソール']} setRunResults={setRunResults}>
            <ConsoleTab {...props} setRunResults={setRunResults}></ConsoleTab>
        </ConsoleBox>
    );
};
