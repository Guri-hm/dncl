import { FC, JSX, useState } from "react";
import { TreeItems } from "@/app/types";
import cmnStyles from './common.module.css'
import { Allotment } from "allotment";
import TabsBox from "./TabsBox";
import { DnclTab } from "./DnclTab";
import { JsTab } from "./JsTab";
import { PythonTab } from "./PythonTab";
import { VbaTab } from "./VbaTab";
import { closestCenter, DndContext, MeasuringStrategy, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface Props {
    treeItems: TreeItems;
}

interface Tab {
    title: string;
    component: React.ReactNode
}

export const CnvWrapper: FC<Props> = ({ treeItems }) => {

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setTabs2((items) => {
                const oldIndex = items.findIndex((item) => item.title === active.id);
                const newIndex = items.findIndex((item) => item.title === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const [tabs2, setTabs2] = useState([
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
    ]);

    const tabs1: Tab[] = [
        {
            title: 'DNCL', component: <DnclTab treeItems={treeItems}>
                DNCLのコード
            </DnclTab>
        },
    ];

    return (
        <DndContext
            // 衝突検知を collisionDetection={closestCenter} にすると、全エリアでDropOver扱いになる
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
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
        </DndContext>
    );
};
