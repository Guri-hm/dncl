import React, { useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    UniqueIdentifier,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import SortableContainer from "./SortableContainer";
import Item from "./Item";

const Contaienr = () => {
    // ドラッグ&ドロップでソート可能なリスト
    const [items, setItems] = useState<{
        [key: string]: string[];
    }>({
        container1: ["A", "B", "C"],
        container2: ["D", "E", "F"],
        container3: ["G", "H", "I"],
        container4: [],
    });

    //リストのリソースid（リストの値）
    const [activeId, setActiveId] = useState<UniqueIdentifier>();

    // ドラッグの開始、移動、終了などにどのような入力を許可するかを決めるprops
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    //各コンテナ取得関数
    const findContainer = (id: UniqueIdentifier) => {
        if (id in items) {
            return id;
        }
        return Object.keys(items).find((key: string) =>
            items[key].includes(id.toString())
        );
    };

    // ドラッグ開始時に発火する関数
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        //ドラッグしたリソースのid
        const id = active.id.toString();
        setActiveId(id);
    };

    //ドラッグ可能なアイテムがドロップ可能なコンテナの上に移動時に発火する関数
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        //ドラッグしたリソースのid
        const id = active.id.toString();
        //ドロップした場所にあったリソースのid
        const overId = over?.id;

        if (!overId) return;

        // ドラッグ、ドロップ時のコンテナ取得
        // container1,container2のいずれかを持つ
        const activeContainer = findContainer(id);
        const overContainer = findContainer(over?.id);

        console.log(items["container1"])
        console.log(items["container2"])
        console.log("bbb")
        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        console.log("aaaa")
        setItems((prev) => {
            // 移動元のコンテナの要素配列を取得
            const activeItems = prev[activeContainer];
            // 移動先のコンテナの要素配列を取得
            const overItems = prev[overContainer];

            // 配列のインデックス取得
            const activeIndex = activeItems.indexOf(id);
            const overIndex = overItems.indexOf(overId.toString());

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem = over && overIndex === overItems.length - 1;

                const modifier = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            console.log(activeIndex)
            console.log(items[activeContainer][activeIndex])
            return {
                ...prev,
                // 元のコンテナから要素を消さない場合はコメントアウト
                // [activeContainer]: [
                //     ...prev[activeContainer].filter((item) => item !== active.id),
                // ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    items[activeContainer][activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    // ドラッグ終了時に発火する関数
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        //ドラッグしたリソースのid
        const id = active.id.toString();
        //ドロップした場所にあったリソースのid
        const overId = over?.id;
        if (!overId) return;

        // ドラッグ、ドロップ時のコンテナ取得
        // container1,container2,container3,container4のいずれかを持つ
        return
        const activeContainer = findContainer(id);
        const overContainer = findContainer(over?.id);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        console.log("bbb")
        console.log(activeContainer)
        console.log(overContainer)
        // 配列のインデックス取得
        const activeIndex = items[activeContainer].indexOf(id);
        const overIndex = items[overContainer].indexOf(overId.toString());
        return
        if (activeIndex !== overIndex) {
            setItems((items) => ({
                ...items,
                [overContainer]: arrayMove(
                    items[overContainer],
                    activeIndex,
                    overIndex
                ),
            }));
        }
        setActiveId(undefined);
    };

    return (
        <div className="mx-auto">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >

                <div className="relative z-10 col-span-3 bg-slate-800 rounded-xl shadow-lg xl:ml-0 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/10">
                    <div className="relative flex text-slate-400 text-xs leading-6">
                        <div className="mt-2 flex-none text-sky-300 border-t border-b border-t-transparent border-b-sky-300 px-4 py-1 flex items-center">DNCL</div>
                        <div className="flex-auto flex pt-2 rounded-tr-xl overflow-hidden">
                            <div className="flex-auto -mr-px bg-slate-700/50 border border-slate-500/30 rounded-tl"></div>
                        </div>
                        <div className="absolute top-2 right-0 h-8 flex items-center pr-4"><div className="relative flex -mr-2">
                            <button type="button" className="text-slate-500 hover:text-slate-400">
                                <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-8 h-8"><path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19"></path><path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5"></path></svg>
                            </button>
                        </div>
                        </div>
                    </div>
                    <div className="relative text-white">

                        {/* SortableContainer */}
                        <SortableContainer
                            id="container1"
                            items={items.container1}
                            label="container1"
                        />
                    </div>
                </div>
                <SortableContainer
                    id="container2"
                    label="container2"
                    items={items.container2}
                />
                {/* DragOverlay */}
                <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
            </DndContext>
        </div>
    );
};

export default Contaienr;
