import { FC, useState } from "react";
import { TreeItems } from "@/app/types";
import cmnStyles from './common.module.css'
import { Allotment } from "allotment";
import TabsBox from "./TabsBox";
import { DnclTab } from "./DnclTab";
import { JsTab } from "./JsTab";
import { PythonTab } from "./PythonTab";
import { VbaTab } from "./VbaTab";

interface Props {
    treeItems: TreeItems;

}

export const CnvWrapper: FC<Props> = ({ treeItems }) => {

    const [code1, setCode1] = useState<React.ReactNode>(null);
    const [code2, setCode2] = useState<React.ReactNode>(null);

    return (
        <Allotment>
            <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>

                <Allotment.Pane className={`${cmnStyles.hFull}`}>
                    <TabsBox tabLabels={['DNCL']}>
                        <DnclTab treeItems={treeItems}></DnclTab>
                    </TabsBox>
                </Allotment.Pane>
            </div>
            <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>

                <Allotment.Pane className={`${cmnStyles.hFull}`}>
                    <TabsBox tabLabels={['javascript', 'Python', 'VBA']}>
                        <JsTab treeItems={treeItems}>
                            {code2}
                        </JsTab>
                        <PythonTab treeItems={treeItems}>
                            {code2}
                        </PythonTab>
                        <VbaTab treeItems={treeItems}>
                            {code2}
                        </VbaTab>
                    </TabsBox>
                </Allotment.Pane>
            </div>

        </Allotment>
    );
};
