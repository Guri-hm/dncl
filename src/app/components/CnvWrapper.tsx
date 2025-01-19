import { FC, JSX, useState } from "react";
import { TreeItems } from "@/app/types";
import cmnStyles from './common.module.css'
import { Allotment } from "allotment";
import TabsBox, { a11yProps, CustomTab, CustomTabs } from "./TabsBox";
import { DnclTab } from "./DnclTab";
import { JsTab } from "./JsTab";
import { PythonTab } from "./PythonTab";
import { VbaTab } from "./VbaTab";
import { closestCenter, DndContext, MeasuringStrategy, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { SimpleSortableItem } from "./SimpleSortableItem";
import { Tabs } from "@mui/material";

interface Props {
    treeItems: TreeItems;
}

interface Tab {
    id: number;
    label: string;
    component: React.ReactNode
}

export const CnvWrapper: FC<Props> = ({ treeItems }) => {

    type Item = {
        id: number;
        text: string;
    };
    const ITEMS: Item[] = [
        { id: 1, text: "項目１" },
        { id: 2, text: "項目２" },
        { id: 3, text: "項目３" },
        { id: 4, text: "項目４" },
        { id: 5, text: "項目５" }
    ];

    const [items, setItems] = useState(ITEMS);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setTabs2((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const [tabs2, setTabs2] = useState<Tab[]>([
        {
            id: 1, label: 'javascript', component: <JsTab treeItems={treeItems}>
                javascriptのコード
            </JsTab>
        },
        {
            id: 2, label: 'Python', component: <PythonTab treeItems={treeItems}>
                Pythonのコード
            </PythonTab>
        },
        {
            id: 3, label: 'VBA', component: <VbaTab treeItems={treeItems}>
                VBAのコード
            </VbaTab>
        },
    ]);

    const tabs1: Tab[] = [
        {
            id: 4, label: 'DNCL', component: <DnclTab treeItems={treeItems}>
                DNCLのコード
            </DnclTab>
        },
    ];
    const tabIdsLabels: { id: number, label: string }[] = tabs2.map(tab => { return { id: tab.id, label: tab.label } });

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
