import { FC, useEffect, useRef, useState, Suspense, lazy } from "react";
import { TabGroup, TabItem, TabItemsObj, TreeItems } from "@/app/types";
import cmnStyles from '@/app/components/common.module.css'
import { Allotment, AllotmentHandle } from "allotment";
import { closestCenter, DndContext, DragEndEvent, DragOverEvent, MeasuringStrategy, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';

// 遅延読み込み
const VbaTab = lazy(() => import('./VbaTab').then(module => ({ default: module.VbaTab })));
const DnclTab = lazy(() => import('./DnclTab').then(module => ({ default: module.DnclTab })));
const JsTab = lazy(() => import('./JsTab').then(module => ({ default: module.JsTab })));
const PythonTab = lazy(() => import('./PythonTab').then(module => ({ default: module.PythonTab })));
const FlowTab = lazy(() => import('./FlowTab').then(module => ({ default: module.FlowTab })));
const TabsBox = lazy(() => import('./TabsBox'));
const TabsSingleBox = lazy(() => import('./TabsSingleBox'));

// ローディングコンポーネント
const TabLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="150px">
        <CircularProgress size={20} />
        <Box ml={1}>タブを読み込み中...</Box>
    </Box>
);

interface Props {
    treeItems: TreeItems;
    setTabsBoxWrapperVisible: (visible: boolean) => void;
    tabsBoxWrapperVisible: boolean;
}

export const TabsBoxWrapper: FC<Props> = ({ treeItems, tabsBoxWrapperVisible, setTabsBoxWrapperVisible }) => {
    const ref = useRef<AllotmentHandle>(null);
    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'));//900px以上
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上

    // TabComponentのレンダリング関数（遅延読み込み対応）
    const renderTabComponent = (label: string, treeItems: TreeItems, children: string) => {
        switch (label) {
            case 'DNCL':
                return (
                    <Suspense fallback={<TabLoadingFallback />}>
                        <DnclTab treeItems={treeItems}>{children}</DnclTab>
                    </Suspense>
                );
            case 'javascript':
                return (
                    <Suspense fallback={<TabLoadingFallback />}>
                        <JsTab treeItems={treeItems}>{children}</JsTab>
                    </Suspense>
                );
            case 'Python':
                return (
                    <Suspense fallback={<TabLoadingFallback />}>
                        <PythonTab treeItems={treeItems}>{children}</PythonTab>
                    </Suspense>
                );
            case 'VBA':
                return (
                    <Suspense fallback={<TabLoadingFallback />}>
                        <VbaTab treeItems={treeItems}>{children}</VbaTab>
                    </Suspense>
                );
            case 'フローチャート':
                return (
                    <Suspense fallback={<TabLoadingFallback />}>
                        <FlowTab treeItems={treeItems}>{children}</FlowTab>
                    </Suspense>
                );
            default:
                return <TabLoadingFallback />;
        }
    };

    const [tabItemsObj, setTabItemsObj] = useState<TabItemsObj>(isMd ? {
        group1: {
            visible: true,
            items: [
                {
                    id: 4,
                    label: 'DNCL',
                    component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                },
                {
                    id: 5,
                    label: 'フローチャート',
                    component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                },
            ],
        },
        group2: {
            visible: true,
            items: [
                {
                    id: 1,
                    label: 'javascript',
                    component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                },
                {
                    id: 2,
                    label: 'Python',
                    component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                },
                {
                    id: 3,
                    label: 'VBA',
                    component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                },
            ],
        },
    } : {
        group1: {
            visible: true,
            items: [
                {
                    id: 4,
                    label: 'DNCL',
                    component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                },
                {
                    id: 5,
                    label: 'フローチャート',
                    component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                },
                {
                    id: 1,
                    label: 'javascript',
                    component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                },
                {
                    id: 2,
                    label: 'Python',
                    component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                },
                {
                    id: 3,
                    label: 'VBA',
                    component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                },
            ]
        }
    });

    useEffect(() => {
        // `treeItems` が変更されるたびに `tabItemsObj` の `component` 部分のみを更新
        setTabItemsObj(prevTabItemsObj => {
            const updateComponents = (group: TabGroup) => group.items.map((item: TabItem) => ({
                ...item,
                component: (() => {
                    switch (item.label) {
                        case 'DNCL':
                            return renderTabComponent('DNCL', treeItems, 'DNCLのコード');
                        case 'javascript':
                            return renderTabComponent('javascript', treeItems, 'javascriptのコード');
                        case 'Python':
                            return renderTabComponent('Python', treeItems, 'Pythonのコード');
                        case 'VBA':
                            return renderTabComponent('VBA', treeItems, 'VBAのコード');
                        case 'フローチャート':
                            return renderTabComponent('フローチャート', treeItems, 'フローチャート');
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
    }, [tabItemsObj, setTabsBoxWrapperVisible]);

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

    return (
        <>
            {isSm ?
                tabsBoxWrapperVisible ?
                    isMd ?
                        <DndContext
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
                                                <Suspense fallback={<TabLoadingFallback />}>
                                                    <TabsBox tabItems={tabItemsObj[containerId].items} disabled={isSortingContainer} containerId={containerId} setTabItemsObj={setTabItemsObj} />
                                                </Suspense>
                                            </div>
                                        </Allotment.Pane>
                                    })}
                                </Allotment>
                            </SortableContext>
                        </DndContext>
                        :
                        <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '17px', marginRight: '5px' }}>
                            <Allotment minSize={0} className={`${cmnStyles.hFull}`}>
                                <Suspense fallback={<TabLoadingFallback />}>
                                    <TabsSingleBox tabItems={tabItemsObj['group1'].items} containerId={'group1'} setTabItemsObj={setTabItemsObj} />
                                </Suspense>
                            </Allotment>
                        </div>
                    : null
                :
                <div className={`${cmnStyles.hFull}`}>
                    <Suspense fallback={<TabLoadingFallback />}>
                        <TabsSingleBox tabItems={tabItemsObj['group1'].items} />
                    </Suspense>
                </div>
            }
        </>
    );
};