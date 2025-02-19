import { FC, useEffect, useRef, useState } from "react";
import { TabGroup, TabItem, TabItemsObj, TreeItems } from "@/app/types";
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
import { FlowTab } from "./FlowTab";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { TabsSingleBox } from "./TabsSingleBox";

interface Props {
    treeItems: TreeItems;
    setTabsBoxWrapperVisible: any;
    tabsBoxWrapperVisible: boolean;
}

export const TabsBoxWrapper: FC<Props> = ({ treeItems, tabsBoxWrapperVisible, setTabsBoxWrapperVisible }) => {
    const ref = useRef<any>(null);
    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'));//900px以上
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上

    const [tabItemsObj, setTabItemsObj] = useState<TabItemsObj>(isMd ? {
        group1: {
            visible: true, // or false, depending on the initial state
            items: [
                {
                    id: 4, label: 'DNCL', component: <DnclTab treeItems={treeItems}>
                        DNCLのコード
                    </DnclTab>
                },
                {
                    id: 5, label: 'フローチャート', component: <FlowTab treeItems={treeItems}>
                        フローチャート
                    </FlowTab>
                },
            ],
        },
        group2: {
            visible: true, // or false, depending on the initial state
            items: [
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
        },
    } :
        {
            group1: {
                visible: true, // or false, depending on the initial state
                items: [
                    {
                        id: 4, label: 'DNCL', component: <DnclTab treeItems={treeItems}>
                            DNCLのコード
                        </DnclTab>
                    },
                    {
                        id: 5, label: 'フローチャート', component: <FlowTab treeItems={treeItems}>
                            フローチャート
                        </FlowTab>
                    },
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
                ]
            }
        }
    );

    useEffect(() => {
        // `treeItems` が変更されるたびに `tabItemsObj` の `component` 部分のみを更新
        setTabItemsObj(prevTabItemsObj => {
            const updateComponents = (group: TabGroup) => group.items.map((item: TabItem) => ({
                ...item,
                component: (() => {
                    switch (item.label) {
                        case 'DNCL':
                            return <DnclTab treeItems={treeItems}>DNCLのコード</DnclTab>;
                        case 'javascript':
                            return <JsTab treeItems={treeItems}>javascriptのコード</JsTab>;
                        case 'Python':
                            return <PythonTab treeItems={treeItems}>Pythonのコード</PythonTab>;
                        case 'VBA':
                            return <VbaTab treeItems={treeItems}>VBAのコード</VbaTab>;
                        case 'フローチャート':
                            return <FlowTab treeItems={treeItems}>フローチャート</FlowTab>;
                        default:
                            return item.component;
                    }
                })()
            }));

            const updatedTabItemsObj: TabItemsObj = {
                group1: {
                    ...prevTabItemsObj.group1,
                    items: updateComponents(prevTabItemsObj.group1)
                }
            };

            if (prevTabItemsObj.group2) {
                updatedTabItemsObj.group2 = {
                    ...prevTabItemsObj.group2,
                    items: updateComponents(prevTabItemsObj.group2)
                };
            }

            return updatedTabItemsObj;
        });
    }, [treeItems]);

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
            const foundItem = tabItemsObj[key].items.find(item => item.id === id);
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
            setTabItemsObj((obj) => {
                const activeItems = obj[activeContainer].items;
                const overItems = obj[overContainer].items;
                const activeIndex = activeItems.map(item => item.id).indexOf(active.id);
                const overIndex = overItems.map(item => item.id).indexOf(overId);

                let newIndex: number;

                if (overId in obj) {
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
                    ...obj,
                    [activeContainer]: {
                        ...obj[activeContainer],
                        items: obj[activeContainer].items.filter(
                            (item) => item.id !== active.id
                        ),
                    },
                    [overContainer]: {
                        ...obj[overContainer],
                        items: [
                            ...obj[overContainer].items.slice(0, newIndex),
                            obj[activeContainer].items[activeIndex],
                            ...obj[overContainer].items.slice(
                                newIndex,
                                obj[overContainer].items.length
                            ),
                        ],
                    },
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
            const activeIndex = tabItemsObj[activeContainer].items.map(item => item.id).indexOf(active.id);
            const overIndex = tabItemsObj[overContainer].items.map(item => item.id).indexOf(overId);

            if (activeIndex !== overIndex) {
                setTabItemsObj((obj) => ({
                    ...obj,
                    [overContainer]: {
                        ...obj[overContainer],
                        items: arrayMove(
                            obj[overContainer].items,
                            activeIndex,
                            overIndex
                        ),
                    },
                }));
            }
        }
        setActiveId(null);
    };

    useEffect(() => {
        const areAllVisibleFalse = (obj: TabItemsObj) => {
            return Object.keys(obj).every(key => !obj[key].visible);
        };
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
        const allVisibleFalse = areAllVisibleFalse(tabItemsObj);
        if (allVisibleFalse) {
            setTabsBoxWrapperVisible(false);
        }
    }, [tabItemsObj]);

    useEffect(() => {
        const toggleAllVisible = (newVisible: boolean) => {
            setTabItemsObj((prevState: TabItemsObj) => {
                const updatedObj: TabItemsObj = {};
                for (const group in prevState) {
                    updatedObj[group] = {
                        ...prevState[group],
                        visible: newVisible,
                    };
                }
                return updatedObj;
            });
        };
        if (tabsBoxWrapperVisible) {
            toggleAllVisible(true);
        }
    }, [tabsBoxWrapperVisible]);

    // const isInitialRender = useRef(true);
    // useEffect(() => {
    //     if (isInitialRender.current) {
    //         isInitialRender.current = false;
    //         return;
    //     }
    //     const getVisibleArray = (obj: TabItemsObj) => {
    //         return Object.keys(obj).map(key => obj[key].visible ? 300 : 0);
    //     };

    //     const visibleArray = getVisibleArray(tabItemsObj);

    //     if (ref.current) {
    //         //初回レンダリング時はminimumsizeが取得できないエラーがでる
    //         ref.current.resize(visibleArray);
    //     }

    // }, Object.keys(tabItemsObj).map(key => tabItemsObj[key].visible));

    return (
        <>
            {isMd ?
                tabsBoxWrapperVisible ?
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
                            <Allotment minSize={0} className={`${cmnStyles.hFull}`} ref={ref}>
                                {containers.map((containerId) => {
                                    return <Allotment.Pane minSize={0} snap visible={tabItemsObj[containerId].visible} key={containerId}>
                                        <div key={containerId} className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>
                                            <TabsBox tabItems={tabItemsObj[containerId].items} disabled={isSortingContainer} containerId={containerId} setTabItemsObj={setTabItemsObj} />
                                        </div>
                                    </Allotment.Pane>
                                }
                                )}
                            </Allotment>
                        </SortableContext>
                    </DndContext>
                    : null
                :
                <div className={`${cmnStyles.hFull}`}>
                    <TabsSingleBox tabItems={tabItemsObj['group1'].items} />
                </div>
            }

        </>
    );
};
