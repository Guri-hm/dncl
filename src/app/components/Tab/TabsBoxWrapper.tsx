import { FC, useEffect, useRef, useState, Suspense, lazy, useCallback } from "react";
import { TabGroup, TabItem, TabItemsObj, TreeItems } from "@/app/types";
import cmnStyles from '@/app/components/common.module.css'
import { Allotment, AllotmentHandle } from "allotment";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    MeasuringStrategy,
    UniqueIdentifier,
    useDroppable,
    rectIntersection,
    pointerWithin,
    DroppableContainer,
    CollisionDetection
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Tab } from '@mui/material';
import { Handle } from "@/app/components/TreeItem/Handle";

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

// DragOverlay用のコンポーネント（ハンドル位置を中心にする）
const DragOverlayTab = ({ item }: { item: TabItem }) => (
    <Box
        style={{
            display: 'flex',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: '6px',
            padding: '4px 8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 999999,
            // ハンドル部分（24px）の中心をカーソル位置に合わせる
            transform: 'translateX(-12px)', // ハンドル幅の半分だけ左にオフセット
        }}
    >
        <span style={{
            width: '24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grabbing',
            flexShrink: 0,
        }}>
            <Handle />
        </span>
        <Tab
            label={item.label}
            sx={{
                flex: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                minHeight: 'auto',
                minWidth: 'auto',
                paddingLeft: '3px',
                paddingRight: '10px',
                margin: '0px',
                color: '#e2e8f0',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
            }}
        />
    </Box>
);

// 最適化されたプレースホルダー
const DroppablePlaceholder = ({ id, position }: { id: string; position: 'left' | 'right' }) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                height: '100%',
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isOver ? '2px dashed #007FFF' : '2px dashed #666',
                borderRadius: '8px',
                color: isOver ? '#007FFF' : '#666',
                fontSize: '2rem',
                backgroundColor: isOver ? 'rgba(0, 127, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                transition: isOver ? 'none' : 'all 0.2s ease',
                opacity: 0.8,
                margin: '8px',
                willChange: isOver ? 'background-color, border-color' : 'auto',
            }}
        >
            +
        </Box>
    );
};

// カスタム衝突検出関数
const customCollisionDetection: CollisionDetection = (args) => {
    const { droppableContainers } = args;

    // プレースホルダーに対してはrectIntersection（要素の重なり判定）を使用
    const placeholderIds = ['placeholder-left', 'placeholder-right'];
    const placeholderContainers = Array.from(droppableContainers.values()).filter(
        (container) => placeholderIds.includes(String(container.id))
    );

    if (placeholderContainers.length > 0) {
        const intersections = rectIntersection({
            ...args,
            droppableContainers: placeholderContainers
        });

        if (intersections && intersections.length > 0) {
            return intersections;
        }
    }

    // その他の要素に対してはpointerWithin（ポインター位置判定）を使用
    const otherContainers = Array.from(droppableContainers.values()).filter(
        (container) => !placeholderIds.includes(String(container.id))
    );

    return pointerWithin({
        ...args,
        droppableContainers: otherContainers
    });
};

interface Props {
    treeItems: TreeItems;
    setTabsBoxWrapperVisible: (visible: boolean) => void;
    tabsBoxWrapperVisible: boolean;
}

export const TabsBoxWrapper: FC<Props> = ({ treeItems, tabsBoxWrapperVisible, setTabsBoxWrapperVisible }) => {
    const ref = useRef<AllotmentHandle>(null);
    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    const [isDragging, setIsDragging] = useState(false);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeItem, setActiveItem] = useState<TabItem | null>(null);

    const renderTabComponent = useCallback((label: string, treeItems: TreeItems, children: string, uniqueId?: string) => {
        const key = uniqueId ? `${label}_${uniqueId}` : `${label}_${Date.now()}`;

        switch (label) {
            case 'DNCL':
                return (
                    <Suspense key={key} fallback={<TabLoadingFallback />}>
                        <DnclTab treeItems={treeItems}>{children}</DnclTab>
                    </Suspense>
                );
            case 'javascript':
                return (
                    <Suspense key={key} fallback={<TabLoadingFallback />}>
                        <JsTab treeItems={treeItems}>{children}</JsTab>
                    </Suspense>
                );
            case 'Python':
                return (
                    <Suspense key={key} fallback={<TabLoadingFallback />}>
                        <PythonTab treeItems={treeItems}>{children}</PythonTab>
                    </Suspense>
                );
            case 'VBA':
                return (
                    <Suspense key={key} fallback={<TabLoadingFallback />}>
                        <VbaTab treeItems={treeItems}>{children}</VbaTab>
                    </Suspense>
                );
            case 'フローチャート':
                return (
                    <Suspense key={key} fallback={<TabLoadingFallback />}>
                        <FlowTab treeItems={treeItems}>{children}</FlowTab>
                    </Suspense>
                );
            default:
                return <TabLoadingFallback />;
        }
    }, []);

    const generateUniqueKey = () => `group_${Date.now()}_${Math.random()}`;

    const [tabItemsObj, setTabItemsObj] = useState<TabItemsObj>(() => {
        return isMd ? {
            [generateUniqueKey()]: {
                visible: true,
                items: [
                    {
                        id: `dncl_${Date.now()}`,
                        label: 'DNCL',
                        component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                    },
                    {
                        id: `flow_${Date.now()}`,
                        label: 'フローチャート',
                        component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                    },
                ],
            },
            [generateUniqueKey()]: {
                visible: true,
                items: [
                    {
                        id: `js_${Date.now()}`,
                        label: 'javascript',
                        component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                    },
                    {
                        id: `python_${Date.now()}`,
                        label: 'Python',
                        component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                    },
                    {
                        id: `vba_${Date.now()}`,
                        label: 'VBA',
                        component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                    },
                ],
            },
        } : {
            [generateUniqueKey()]: {
                visible: true,
                items: [
                    {
                        id: `dncl_${Date.now()}`,
                        label: 'DNCL',
                        component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                    },
                    {
                        id: `flow_${Date.now()}`,
                        label: 'フローチャート',
                        component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                    },
                    {
                        id: `js_${Date.now()}`,
                        label: 'javascript',
                        component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                    },
                    {
                        id: `python_${Date.now()}`,
                        label: 'Python',
                        component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                    },
                    {
                        id: `vba_${Date.now()}`,
                        label: 'VBA',
                        component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                    },
                ]
            }
        };
    });

    const [containers, setContainers] = useState<UniqueIdentifier[]>(() =>
        Object.keys(tabItemsObj) as UniqueIdentifier[]
    );

    const createNewTabsBox = (tabItem: TabItem, insertIndex: number): string => {
        const newGroupKey = generateUniqueKey();
        setTabItemsObj(prev => ({
            ...prev,
            [newGroupKey]: {
                visible: true,
                items: [tabItem]
            }
        }));

        setContainers(prev => {
            const newContainers = [...prev];
            newContainers.splice(insertIndex, 0, newGroupKey);
            return newContainers;
        });

        return newGroupKey;
    };

    const getChildrenText = (label: string): string => {
        switch (label) {
            case 'DNCL': return 'DNCLのコード';
            case 'javascript': return 'javascriptのコード';
            case 'Python': return 'Pythonのコード';
            case 'VBA': return 'VBAのコード';
            case 'フローチャート': return 'フローチャート';
            default: return '';
        }
    };

    // treeItemsが変更された時のみコンポーネントを更新
    useEffect(() => {
        setTabItemsObj(prevTabItemsObj => {
            const updateComponents = (group: TabGroup) => group.items.map((item: TabItem) => ({
                ...item,
                component: renderTabComponent(item.label, treeItems, getChildrenText(item.label), item.id.toString())
            }));

            const updatedTabItemsObj: TabItemsObj = {};

            for (const groupKey of Object.keys(prevTabItemsObj)) {
                updatedTabItemsObj[groupKey] = {
                    ...prevTabItemsObj[groupKey],
                    items: updateComponents(prevTabItemsObj[groupKey])
                };
            }

            return updatedTabItemsObj;
        });
    }, [treeItems, renderTabComponent]);

    // 空のコンテナを削除（別のuseEffectで管理）
    useEffect(() => {
        const validContainers = Object.keys(tabItemsObj).filter(key =>
            tabItemsObj[key] && tabItemsObj[key].items.length > 0
        );

        if (validContainers.length !== containers.length) {
            setContainers(validContainers as UniqueIdentifier[]);

            // 空のコンテナを削除
            setTabItemsObj(prev => {
                const newObj: TabItemsObj = {};
                validContainers.forEach(key => {
                    if (prev[key]) {
                        newObj[key] = prev[key];
                    }
                });
                return newObj;
            });
        }
    }, [tabItemsObj, containers.length]);

    const PLACEHOLDER_LEFT = "placeholder-left";
    const PLACEHOLDER_RIGHT = "placeholder-right";

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

    const findItem = (id: UniqueIdentifier): TabItem | null => {
        for (const key of Object.keys(tabItemsObj)) {
            const foundItem = tabItemsObj[key].items.find(item => item.id === id);
            if (foundItem) {
                return foundItem;
            }
        }
        return null;
    };

    // handleDragOverの最適化（スロットリング）
    const lastDragOverTime = useRef(0);
    const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
        const now = Date.now();
        // 16ms以下の間隔での処理をスキップ（60FPS制限）
        if (now - lastDragOverTime.current < 16) {
            return;
        }
        lastDragOverTime.current = now;

        const overId = over?.id;

        if ((overId === PLACEHOLDER_LEFT || overId === PLACEHOLDER_RIGHT) && !(active.id in tabItemsObj)) {
            return;
        }

        if (overId == null || active.id in tabItemsObj) {
            return;
        }

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
    }, [tabItemsObj, findContainer, PLACEHOLDER_LEFT, PLACEHOLDER_RIGHT]);

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setIsDragging(false);
        setActiveId(null);
        setActiveItem(null);

        if (!active.id) {
            return;
        }

        // プレースホルダーへのドロップ処理
        if ((over?.id === PLACEHOLDER_LEFT || over?.id === PLACEHOLDER_RIGHT) && !(active.id in tabItemsObj)) {
            const activeContainer = findContainer(active.id);
            if (activeContainer) {
                const activeItem = tabItemsObj[activeContainer].items.find(item => item.id === active.id);
                if (activeItem) {
                    const insertIndex = over.id === PLACEHOLDER_LEFT ? 0 : containers.length;
                    createNewTabsBox(activeItem, insertIndex);

                    setTabItemsObj(prev => {
                        const newObj = { ...prev };
                        newObj[activeContainer] = {
                            ...newObj[activeContainer],
                            items: newObj[activeContainer].items.filter(item => item.id !== active.id)
                        };
                        return newObj;
                    });
                }
            }
            return;
        }

        if (active.id in tabItemsObj && over?.id) {
            setContainers((containers) => {
                const activeIndex = containers.indexOf(active.id);
                const overIndex = containers.indexOf(over.id);

                return arrayMove(containers, activeIndex, overIndex);
            });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
            return;
        }

        const overId = over?.id;

        if (overId == null) {
            return;
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
                        <div style={{ height: '100%', overflow: 'visible' }}>
                            <DndContext
                                collisionDetection={customCollisionDetection}
                                onDragStart={({ active }) => {
                                    setActiveId(active.id);
                                    setIsDragging(true);
                                    const item = findItem(active.id);
                                    setActiveItem(item);
                                }}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                                measuring={{
                                    droppable: {
                                        strategy: MeasuringStrategy.Always,
                                    },
                                }}
                                accessibility={{
                                    announcements: {
                                        onDragStart: () => '',
                                        onDragOver: () => '',
                                        onDragEnd: () => '',
                                        onDragCancel: () => '',
                                    },
                                }}
                            >
                                <SortableContext items={containers}>
                                    <Allotment minSize={0} className={`${cmnStyles.hFull}`} ref={ref}>
                                        {isDragging && (
                                            <Allotment.Pane minSize={60} maxSize={60}>
                                                <DroppablePlaceholder id={PLACEHOLDER_LEFT} position="left" />
                                            </Allotment.Pane>
                                        )}

                                        {containers.map((containerId) => {
                                            const tabGroup = tabItemsObj[containerId];
                                            if (!tabGroup || tabGroup.items.length === 0) return null;

                                            return <Allotment.Pane minSize={100} snap visible={tabGroup.visible} key={containerId}>
                                                <div key={containerId} className={`${cmnStyles.hFull}`} style={{
                                                    marginLeft: '16px',
                                                    overflow: 'visible'
                                                }}>
                                                    <Suspense fallback={<TabLoadingFallback />}>
                                                        <TabsBox tabItems={tabGroup.items} disabled={isSortingContainer} containerId={containerId} setTabItemsObj={setTabItemsObj} />
                                                    </Suspense>
                                                </div>
                                            </Allotment.Pane>
                                        })}

                                        {isDragging && (
                                            <Allotment.Pane minSize={60} maxSize={60}>
                                                <DroppablePlaceholder id={PLACEHOLDER_RIGHT} position="right" />
                                            </Allotment.Pane>
                                        )}
                                    </Allotment>
                                </SortableContext>

                                {/* DragOverlayでポータル化、ハンドル中心でカーソルに追従 */}
                                <DragOverlay adjustScale={false} dropAnimation={null}>
                                    {activeItem ? <DragOverlayTab item={activeItem} /> : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                        :
                        <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '17px', marginRight: '5px' }}>
                            <Allotment minSize={0} className={`${cmnStyles.hFull}`}>
                                <Suspense fallback={<TabLoadingFallback />}>
                                    <TabsSingleBox tabItems={tabItemsObj[Object.keys(tabItemsObj)[0]]?.items || []} containerId={Object.keys(tabItemsObj)[0]} setTabItemsObj={setTabItemsObj} />
                                </Suspense>
                            </Allotment>
                        </div>
                    : null
                :
                <div className={`${cmnStyles.hFull}`}>
                    <Suspense fallback={<TabLoadingFallback />}>
                        <TabsSingleBox tabItems={tabItemsObj[Object.keys(tabItemsObj)[0]]?.items || []} />
                    </Suspense>
                </div>
            }
        </>
    );
};