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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

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

// DragOverlay用のコンポーネント（タブドラッグ時のみ補正）
const DragOverlayTab = ({ item, isDragging }: { item: TabItem; isDragging: boolean }) => {
    // プレースホルダーが表示されている場合の補正値（タブドラッグ時のみ）
    const placeholderOffset = isDragging ? -76 : 0;
    const handleOffset = -12; // ハンドル幅の半分

    return (
        <Box
            style={{
                display: 'flex',
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                borderRadius: '6px',
                padding: '4px 8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                zIndex: 999999,
                // タブドラッグ時のみプレースホルダー補正を適用
                transform: `translateX(${placeholderOffset + handleOffset}px)`,
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
};

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

const DragOverlayTabsBox = ({ containerId, tabItems, originalWidth }: {
    containerId: UniqueIdentifier;
    tabItems: TabItem[];
    originalWidth?: number;
}) => (
    <Box
        style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            zIndex: 999999,
            // 元のTabsBoxの幅を使用、フォールバックとして最小幅を設定
            width: originalWidth ? `${originalWidth}px` : 'auto',
            minWidth: '200px',
            maxWidth: originalWidth ? `${originalWidth}px` : '600px',
            border: '2px solid #007FFF',
        }}
    >
        <Box style={{
            color: '#e2e8f0',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }}>
            <SwapHorizIcon fontSize="small" />
            TabsBox ({tabItems.length} tabs)
        </Box>
        <Box style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
        }}>
            {tabItems.slice(0, 3).map((item, index) => (
                <Box
                    key={item.id}
                    style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.8)',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                    }}
                >
                    {item.label}
                </Box>
            ))}
            {tabItems.length > 3 && (
                <Box style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                }}>
                    +{tabItems.length - 3}
                </Box>
            )}
        </Box>
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
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    // SSR対応: クライアントサイドでのみIDを生成
    const [isClient, setIsClient] = useState(false);
    const [activeContainer, setActiveContainer] = useState<{
        id: UniqueIdentifier;
        items: TabItem[];
        width?: number;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeItem, setActiveItem] = useState<TabItem | null>(null);

    // ドラッグ中のアイテムタイプを判定
    const [dragType, setDragType] = useState<'tab' | 'container' | null>(null);

    // TabsBoxのDOMエレメントの幅を取得するためのref
    const tabsBoxRefs = useRef<Map<UniqueIdentifier, HTMLElement>>(new Map());

    useEffect(() => {
        setIsClient(true);
    }, []);

    // ドラッグ中のカーソル制御
    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'grabbing';
        } else {
            document.body.style.cursor = '';
        }

        // クリーンアップ
        return () => {
            document.body.style.cursor = '';
        };
    }, [isDragging]);

    const getTabsBoxWidth = (containerId: UniqueIdentifier): number | undefined => {
        const element = tabsBoxRefs.current.get(containerId);
        if (element) {
            return element.getBoundingClientRect().width;
        }
        return undefined;
    };
    // TabsBoxのrefを登録する関数
    const setTabsBoxRef = useCallback((containerId: UniqueIdentifier, element: HTMLElement | null) => {
        if (element) {
            tabsBoxRefs.current.set(containerId, element);
        } else {
            tabsBoxRefs.current.delete(containerId);
        }
    }, []);

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

    const generateUniqueKey = useCallback(() => {
        if (!isClient) return `group_temp_${Math.random()}`;
        return `group_${Date.now()}_${Math.random()}`;
    }, [isClient]);

    // 初期値の作成を関数外に移動
    const createInitialTabItemsObj = useCallback((): TabItemsObj => {
        const tempKey1 = 'temp_group_1';
        const tempKey2 = 'temp_group_2';

        if (isMd) {
            return {
                [tempKey1]: {
                    visible: true,
                    items: [
                        {
                            id: 'temp_dncl',
                            label: 'DNCL',
                            component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                        },
                        {
                            id: 'temp_flow',
                            label: 'フローチャート',
                            component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                        },
                    ],
                },
                [tempKey2]: {
                    visible: true,
                    items: [
                        {
                            id: 'temp_js',
                            label: 'javascript',
                            component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                        },
                        {
                            id: 'temp_python',
                            label: 'Python',
                            component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                        },
                        {
                            id: 'temp_vba',
                            label: 'VBA',
                            component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                        },
                    ],
                },
            };
        } else {
            return {
                [tempKey1]: {
                    visible: true,
                    items: [
                        {
                            id: 'temp_dncl',
                            label: 'DNCL',
                            component: renderTabComponent('DNCL', treeItems, 'DNCLのコード')
                        },
                        {
                            id: 'temp_flow',
                            label: 'フローチャート',
                            component: renderTabComponent('フローチャート', treeItems, 'フローチャート')
                        },
                        {
                            id: 'temp_js',
                            label: 'javascript',
                            component: renderTabComponent('javascript', treeItems, 'javascriptのコード')
                        },
                        {
                            id: 'temp_python',
                            label: 'Python',
                            component: renderTabComponent('Python', treeItems, 'Pythonのコード')
                        },
                        {
                            id: 'temp_vba',
                            label: 'VBA',
                            component: renderTabComponent('VBA', treeItems, 'VBAのコード')
                        },
                    ]
                }
            };
        }
    }, [isMd, renderTabComponent, treeItems]);

    const [tabItemsObj, setTabItemsObj] = useState<TabItemsObj>(createInitialTabItemsObj);

    const [containers, setContainers] = useState<UniqueIdentifier[]>(() =>
        Object.keys(createInitialTabItemsObj()) as UniqueIdentifier[]
    );

    // クライアントサイドでIDを再生成
    useEffect(() => {
        if (isClient) {
            const newKey1 = generateUniqueKey();
            const newKey2 = generateUniqueKey();

            setTabItemsObj(prev => {
                const keys = Object.keys(prev);
                const newObj: TabItemsObj = {};

                if (isMd) {
                    newObj[newKey1] = {
                        ...prev[keys[0]],
                        items: prev[keys[0]].items.map((item, index) => ({
                            ...item,
                            id: index === 0 ? `dncl_${Date.now()}` : `flow_${Date.now() + 1}`
                        }))
                    };
                    if (keys[1]) {
                        newObj[newKey2] = {
                            ...prev[keys[1]],
                            items: prev[keys[1]].items.map((item, index) => ({
                                ...item,
                                id: index === 0 ? `js_${Date.now() + 2}` :
                                    index === 1 ? `python_${Date.now() + 3}` : `vba_${Date.now() + 4}`
                            }))
                        };
                    }
                } else {
                    newObj[newKey1] = {
                        ...prev[keys[0]],
                        items: prev[keys[0]].items.map((item, index) => ({
                            ...item,
                            id: `${item.label.toLowerCase()}_${Date.now() + index}`
                        }))
                    };
                }

                return newObj;
            });

            setContainers(isMd ? [newKey1, newKey2] : [newKey1]);
        }
    }, [isClient, generateUniqueKey, isMd]);

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
        setDragType(null); // ドラッグタイプもリセット

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

                                    // ドラッグタイプを判定
                                    if (containers.includes(active.id)) {
                                        setDragType('container');
                                        setActiveItem(null);
                                        // コンテナ情報を保存
                                        const containerData = tabItemsObj[active.id];
                                        const width = getTabsBoxWidth(active.id);
                                        if (containerData) {
                                            setActiveContainer({
                                                id: active.id,
                                                items: containerData.items,
                                                width: width
                                            });
                                        }
                                    } else {
                                        setDragType('tab');
                                        const item = findItem(active.id);
                                        setActiveItem(item);
                                        setActiveContainer(null);
                                    }
                                }}
                                onDragOver={handleDragOver}
                                onDragEnd={({ active, over }: DragEndEvent) => {
                                    setIsDragging(false);
                                    setActiveId(null);
                                    setActiveItem(null);
                                    setDragType(null);
                                    setActiveContainer(null);

                                    // 既存のhandleDragEnd処理をここに移動
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
                                }}
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
                                        {/* プレースホルダーはタブドラッグ時のみ表示 */}
                                        {isDragging && dragType === 'tab' && (
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
                                                }}
                                                    ref={(el) => setTabsBoxRef(containerId, el)}
                                                >
                                                    <Suspense fallback={<TabLoadingFallback />}>
                                                        <TabsBox tabItems={tabGroup.items} disabled={isSortingContainer} containerId={containerId} setTabItemsObj={setTabItemsObj} />
                                                    </Suspense>
                                                </div>
                                            </Allotment.Pane>
                                        })}

                                        {/* プレースホルダーはタブドラッグ時のみ表示 */}
                                        {isDragging && dragType === 'tab' && (
                                            <Allotment.Pane minSize={60} maxSize={60}>
                                                <DroppablePlaceholder id={PLACEHOLDER_RIGHT} position="right" />
                                            </Allotment.Pane>
                                        )}
                                    </Allotment>
                                </SortableContext>

                                {/* DragOverlay - タブとコンテナ両方に対応 */}
                                <DragOverlay adjustScale={false} dropAnimation={null}>
                                    {dragType === 'tab' && activeItem ? (
                                        <DragOverlayTab item={activeItem} isDragging={isDragging} />
                                    ) : dragType === 'container' && activeContainer ? (
                                        <DragOverlayTabsBox
                                            containerId={activeContainer.id}
                                            tabItems={activeContainer.items}
                                            originalWidth={activeContainer.width}
                                        />
                                    ) : null}
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