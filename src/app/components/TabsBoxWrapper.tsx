import { FC, useEffect, useRef, useState } from "react";
import { TabItemsObj, TreeItems } from "@/app/types";
import cmnStyles from './common.module.css'
import { Allotment } from "allotment";
import { TabsBox } from "./TabsBox";
import { DnclTab } from "./DnclTab";
import { JsTab } from "./JsTab";
import { PythonTab } from "./PythonTab";
import { VbaTab } from "./VbaTab";
import { closestCenter, DndContext, DragEndEvent, DragOverEvent, MeasuringStrategy, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

interface Props {
    treeItems: TreeItems;
}

export const TabsBoxWrapper: FC<Props> = ({ treeItems }) => {

    const [tabItemsObj, setTabItemsObj] = useState<TabItemsObj>({
        group1: [
            {
                id: 4, label: 'DNCL', component: <DnclTab treeItems={treeItems}>
                    DNCLのコード
                </DnclTab>
            },
        ],
        group2: [
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
        ],
    });
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [containers, setContainers] = useState(
        Object.keys(tabItemsObj) as UniqueIdentifier[]
    );
    const PLACEHOLDER_ID = "placeholder";

    const recentlyMovedToNewContainer = useRef(false);
    const isSortingContainer = activeId ? containers.includes(activeId) : false;

    const findContainer = (id: UniqueIdentifier) => {
        if (id in tabItemsObj) {
            return id;
        }
        for (const key of Object.keys(tabItemsObj)) {
            const foundItem = tabItemsObj[key].find(item => item.id === id);
            if (foundItem) {
                return key as UniqueIdentifier;
            }
        }
        return null;
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        const overId = over?.id;
        //コンテナ移動時は処理終了
        if (overId == null || active.id in tabItemsObj) {
            return;
        }
        //以降はタブ移動時の処理
        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
            return;
        }
        if (activeContainer !== overContainer) {
            setTabItemsObj((items) => {
                const activeItems = items[activeContainer];
                const overItems = items[overContainer];
                const activeIndex = activeItems.map(item => item.id).indexOf(active.id);
                const overIndex = overItems.map(item => item.id).indexOf(overId);

                let newIndex: number;

                if (overId in items) {
                    newIndex = overItems.length + 1;
                } else {
                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                        over.rect.top + over.rect.height;

                    const modifier = isBelowOverItem ? 1 : 0;

                    newIndex =
                        overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                recentlyMovedToNewContainer.current = true;

                return {
                    ...items,
                    [activeContainer]: items[activeContainer].filter(
                        (item) => item.id !== active.id
                    ),
                    [overContainer]: [
                        ...items[overContainer].slice(0, newIndex),
                        items[activeContainer][activeIndex],
                        ...items[overContainer].slice(
                            newIndex,
                            items[overContainer].length
                        ),
                    ],
                };
            });
        }
    }
    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!active.id) {
            return;
        }

        //コンテナ移動の場合
        if (active.id in tabItemsObj && over?.id) {
            setContainers((containers) => {
                const activeIndex = containers.indexOf(active.id);
                const overIndex = containers.indexOf(over.id);

                return arrayMove(containers, activeIndex, overIndex);
            });
        }

        //以降はタブ移動の場合
        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
            setActiveId(null);
            return;
        }

        const overId = over?.id;

        if (overId == null) {
            setActiveId(null);
            return;
        }

        if (overId === PLACEHOLDER_ID) {
        }

        const overContainer = findContainer(overId);
        if (overContainer) {
            const activeIndex = tabItemsObj[activeContainer].map(item => item.id).indexOf(active.id);
            const overIndex = tabItemsObj[overContainer].map(item => item.id).indexOf(overId);

            if (activeIndex !== overIndex) {
                setTabItemsObj((items) => ({
                    ...items,
                    [overContainer]: arrayMove(
                        items[overContainer],
                        activeIndex,
                        overIndex
                    ),
                }));
            }
        }
        setActiveId(null);
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
    }, [tabItemsObj]);

    return (
        <DndContext
            // 衝突検知を collisionDetection={closestCenter} にすると、全エリアでDropOver扱いになる
            collisionDetection={closestCenter}
            onDragStart={({ active }) => {
                setActiveId(active.id);
            }}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
        >
            <SortableContext items={[...containers, PLACEHOLDER_ID]}>
                <Allotment className={`${cmnStyles.hFull}`}>
                    {containers.map((containerId) => {
                        return <Allotment.Pane key={containerId} snap>
                            <div key={containerId} className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>
                                <TabsBox tabItems={tabItemsObj[containerId]} disabled={isSortingContainer} containerId={containerId} />
                            </div>
                        </Allotment.Pane>
                    }
                    )}
                </Allotment>
            </SortableContext>
        </DndContext>
    );
};
