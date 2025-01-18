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
                            javascriptのコード
                        </JsTab>
                        <PythonTab treeItems={treeItems}>
                            Pythonのコード
                        </PythonTab>
                        <VbaTab treeItems={treeItems}>
                            VBAのコード
                        </VbaTab>
                    </TabsBox>
                </Allotment.Pane>
            </div>

        </Allotment>
    );
};
