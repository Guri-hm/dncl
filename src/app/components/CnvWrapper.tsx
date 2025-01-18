import { FC, JSX, useState } from "react";
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

interface Tab {
    title: string;
    component: React.ReactNode
}

export const CnvWrapper: FC<Props> = ({ treeItems }) => {

    const tabs2: Tab[] = [
        {
            title: 'javascript', component: <JsTab treeItems={treeItems}>
                javascriptのコード
            </JsTab>
        },
        {
            title: 'Python', component: <PythonTab treeItems={treeItems}>
                Pythonのコード
            </PythonTab>
        },
        {
            title: 'VBA', component: <VbaTab treeItems={treeItems}>
                VBAのコード
            </VbaTab>
        },
    ];
    const tabs1: Tab[] = [
        {
            title: 'DNCL', component: <DnclTab treeItems={treeItems}>
                DNCLのコード
            </DnclTab>
        },
    ];
    return (
        <Allotment>
            <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>

                <Allotment.Pane className={`${cmnStyles.hFull}`}>
                    <TabsBox tabs={tabs1} />
                </Allotment.Pane>
            </div>
            <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>

                <Allotment.Pane className={`${cmnStyles.hFull}`}>
                    <TabsBox tabs={tabs2} />
                </Allotment.Pane>
            </div>

        </Allotment>
    );
};
