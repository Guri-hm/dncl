import { FC, JSX, useEffect, useRef, useState } from "react";
import { TreeItems } from "@/app/types";
import cmnStyles from './common.module.css'
import { Allotment } from "allotment";
import TabsBox, { a11yProps, CustomTab, CustomTabs } from "./TabsBox";
import { DnclTab } from "./DnclTab";
import { JsTab } from "./JsTab";
import { PythonTab } from "./PythonTab";
import { VbaTab } from "./VbaTab";
import { closestCenter, DndContext, DragEndEvent, DragOverEvent, MeasuringStrategy, PointerSensor, UniqueIdentifier, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { AnimateLayoutChanges, arrayMove, defaultAnimateLayoutChanges, SortableContext, useSortable } from "@dnd-kit/sortable";
import { SimpleSortableItem } from "./SimpleSortableItem";
import { CSS } from "@dnd-kit/utilities";
import { Container } from "./Container";

interface Props {
    treeItems: TreeItems;
}

interface TabItem {
    id: UniqueIdentifier;
    label: string;
    component: React.ReactNode
}
interface TabItems {
    [key: UniqueIdentifier]: TabItem[];
}

export interface ContainerProps {
    children: React.ReactNode;
    columns?: number;
    label?: string;
    style?: React.CSSProperties;
    horizontal?: boolean;
    hover?: boolean;
    handleProps?: React.HTMLAttributes<any>;
    scrollable?: boolean;
    shadow?: boolean;
    placeholder?: boolean;
    unstyled?: boolean;
    onClick?(): void;
    onRemove?(): void;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
    children,
    columns = 1,
    disabled,
    id,
    items,
    style,
    ...props
}: ContainerProps & {
    disabled?: boolean;
    id: UniqueIdentifier;
    items: UniqueIdentifier[];
    style?: React.CSSProperties;
}) {
    const {
        active,
        attributes,
        isDragging,
        listeners,
        over,
        setNodeRef,
        transition,
        transform,
    } = useSortable({
        id,
        data: {
            type: "container",
            children: items,
        },
        animateLayoutChanges,
    });
    const isOverContainer = over
        ? (id === over.id && active?.data.current?.type !== "container") ||
        items.includes(over.id)
        : false;

    return (
        <Container
            ref={disabled ? undefined : setNodeRef}
            style={{
                ...style,
                transition,
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.5 : undefined,
            }}
            hover={isOverContainer}
            handleProps={{
                ...attributes,
                ...listeners,
            }}
            columns={columns}
            {...props}
        >
            {children}
        </Container>
    );
}

export const CnvWrapper: FC<Props> = ({ treeItems }) => {

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);

    const findContainer = (id: UniqueIdentifier) => {
        if (id in tabItems) {
            return id;
        }
        for (const key of Object.keys(tabItems)) {
            const foundItem = tabItems[key].find(item => item.id === id);
            if (foundItem) {
                return key as UniqueIdentifier;
            }
        }
        return null;
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        const overId = over?.id;
        if (overId == null || active.id in tabItems) {
            return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
            return;
        }

        if (activeContainer !== overContainer) {
            setTabItems((items) => {
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

                console.log("setting items onDragOver");

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
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        console.log(`active.id:${active.id}`)
        console.log(`over.id:${over?.id}`)
        if (!active.id) {
            return;
        }

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
            const activeIndex = tabItems[activeContainer].map(item => item.id).indexOf(active.id);
            const overIndex = tabItems[overContainer].map(item => item.id).indexOf(overId);

            if (activeIndex !== overIndex) {
                setTabItems((items) => ({
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

    const [tabItems, setTabItems] = useState<TabItems>({
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

    const [containers, setContainers] = useState(
        Object.keys(tabItems) as UniqueIdentifier[]
    );
    const PLACEHOLDER_ID = "placeholder";

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
    }, [tabItems]);

    return (
        <DndContext
            // 衝突検知を collisionDetection={closestCenter} にすると、全エリアでDropOver扱いになる
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={({ active }) => {
                setActiveId(active.id);
            }}
            onDragOver={handleDragOver}
        >
            <SortableContext items={[...containers, PLACEHOLDER_ID]}>
                <Allotment>
                    {containers.map((containerId) => (
                        <SortableContext key={containerId} items={tabItems[containerId]}>
                            <div key={containerId} className={`${cmnStyles.hFull}`} style={{ marginLeft: '16px' }}>
                                <Allotment.Pane className={`${cmnStyles.hFull}`}>
                                    <TabsBox tabs={tabItems[containerId]} />
                                </Allotment.Pane>
                            </div>
                        </SortableContext>
                    ))}
                </Allotment>
            </SortableContext>
        </DndContext>
    );
};
