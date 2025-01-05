import React, { useEffect, useMemo, useRef, useState } from "react";
import { Allotment } from "allotment";
import { createPortal } from "react-dom";
import { DndContext } from '@dnd-kit/core';
import {
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  Modifier
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  getEnumIndex,
} from "../utilities";
import { FlattenedItem, SensorContext, TreeItems, FragmentItems, FragmentItem, DnclEditorProps } from "@/app/types";
import { SortableTreeItem, FragmentsListItem, DnclEditDialog } from "../components";
import { v4 as uuidv4 } from "uuid";
import { StatementEnum, StatementJpEnum } from "@/app/enum";
import { processEnum } from "./Dialog/Enum";
import { Box } from "@mui/material";
import styles from './alloment-custom.module.css'
import { ArrowButton } from "./ArrowButton";

const initialItems: TreeItems = [
  {
    id: uuidv4(),
    code: "x ← 2",
    children: [
    ],
    processIndex: getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement),
  },
  {
    id: uuidv4(),
    code: "もし x = 2 ならば",
    children: [
      {
        id: uuidv4(),
        code: "x を表示する",
        children: [],
        processIndex: getEnumIndex(processEnum, processEnum.Output),
      }
    ],
    processIndex: getEnumIndex(processEnum, processEnum.If),
  },
];

const fragments: FragmentItems = [
  {
    id: uuidv4(),
    code: StatementJpEnum.Output,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.Output
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.Input,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.Input
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.Condition,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.Condition
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.ConditionalLoopPreTest,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.ConditionalLoopPreTest
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.ConditionalLoopPostTest,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.ConditionalLoopPostTest
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.SequentialIteration,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.SequentialIteration
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.UserDefinedfunction,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.UserDefinedfunction
  },
  {
    id: uuidv4(),
    code: StatementJpEnum.ExecuteUserDefinedFunction,
    children: [],
    index: 0,
    parentId: null,
    depth: 0,
    statementType: StatementEnum.ExecuteUserDefinedFunction
  },
]

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always
  }
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '1',
      },
    },
  }),
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator,
  indentationWidth = 20,
  removable
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [editor, setEditor] = useState<DnclEditorProps>({ onSubmit: null, open: false, type: StatementEnum.Input, overIndex: 0, treeItems: items, setItems: setItems });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );
    const additionItem = fragments.find(({ id }) => id == activeId);
    if (additionItem) {
      //要素追加のためのドラッグと判定
      //ここで配列に入れた要素は位置移動とドロップ時の処理で消滅し、同じidをもつ要素がドラッグを受け付けなくなる
      flattenedTree.push(additionItem);
    }

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
        [...flattenedItems],
        activeId,
        overId,
        offsetLeft,
        indentationWidth
      )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft
  });
  const sensors = useSensors(
    useSensor(PointerSensor)
    // useSensor(KeyboardSensor, {
    //   coordinateGetter,
    // })
  );

  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [
    flattenedItems
  ]);
  const activeItem = activeId
    ? [...flattenedItems, ...fragments].find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft
    };
  }, [flattenedItems, offsetLeft]);

  const [visible, setVisible] = useState(true);

  if (!isClient) {
    //documentオブジェクトはクライアントサイドでしか利用できないため、サーバサイドのエラーが発生する
    // サーバーサイドでは何もレンダリングしない
    return null;
  }
  return (
    <DndContext
      // 衝突検知を collisionDetection={closestCenter} にすると、全エリアでDropOver扱いになる
      sensors={sensors}
      measuring={measuring}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DnclEditDialog {...editor}></DnclEditDialog>
      <Allotment separator={false} defaultSizes={[100, 100]} className={styles.splitViewContainer} onVisibleChange={(_index, value) => {
        setVisible(value);
      }}>
        <Allotment.Pane maxSize={50} minSize={50} className={`bg-slate-300`}>
          <ArrowButton setVisible={setVisible} visible={visible}></ArrowButton>
        </Allotment.Pane>
        <Allotment.Pane maxSize={300} visible={visible} className={`${styles.leftPane} bg-slate-300`} snap>
          <Box sx={{ padding: '10px' }}>
            <div className="text-lg font-bold">ドラッグして行を追加</div>
            {fragments.map(({ id, code }) => (
              <FragmentsListItem
                key={id}
                id={id}
                value={code}
              />
            ))}
          </Box>
        </Allotment.Pane>
        <Allotment.Pane className={`${styles.rightPane}`} >
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
              <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                {flattenedItems.map(({ id, children, collapsed, depth, code }) => (
                  <SortableTreeItem
                    key={id}
                    id={id}
                    value={code}
                    depth={id === activeId && projected ? projected.depth : depth}
                    indentationWidth={indentationWidth}
                    indicator={indicator}
                    collapsed={Boolean(collapsed && children.length)}
                    onCollapse={
                      collapsible && children.length
                        ? () => handleCollapse(id)
                        : undefined
                    }
                    onRemove={removable ? () => handleRemove(id) : undefined}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
          {createPortal(
            <DragOverlay
              dropAnimation={dropAnimation}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <SortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  value={activeCode ? activeCode : ""}
                  indentationWidth={indentationWidth}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </Allotment.Pane>


        <Allotment.Pane>
          <div className="relative z-10 col-span-3 bg-slate-800 rounded-xl shadow-lg xl:ml-0 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/10">
            <div className="relative flex text-slate-400 text-xs leading-6">
              <div className="mt-2 flex-none text-sky-300 border-t border-b border-t-transparent border-b-sky-300 px-4 py-1 flex items-center">Python</div>
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

            </div>
          </div>
        </Allotment.Pane>
      </Allotment>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId.toString());
    setOverId(activeId.toString());

    const activeItem = [...flattenedItems, ...fragments].find(({ id }) => id === activeId);

    if (activeItem) {
      setActiveCode(activeItem?.code);
    }
    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id.toString() ?? null);
  }

  function refrash() {
    //元の要素のidを更新しないと追加のためのドラッグできなくなる
    fragments.forEach(item => { item.id = uuidv4() });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    const addStatementToTree = (newItem: FlattenedItem, statementText: string, processIndex: number, overIndex: number) => {
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(items));

      newItem = { ...newItem, code: statementText, processIndex: processIndex }

      clonedItems.push(newItem);

      const sortedItems = arrayMove(clonedItems, Number(newItem.id), overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
      refrash();
    }

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(items));
      const fragmentItem: FragmentItem | undefined = fragments.find(({ id }) => id === active.id);
      // const additionItem: FlattenedItem | undefined = fragments.find(({ id }) => id === active.id);

      if (fragmentItem) {
        let clonedItem: FlattenedItem = JSON.parse(JSON.stringify(fragmentItem));
        const newId = uuidv4();

        // clonedItem.id = newId;
        // active.id = newId;
        // clonedItems.push(clonedItem);

        clonedItem = { ...clonedItem, id: newId, depth: depth, parentId: parentId }
        setEditor((prevState: DnclEditorProps) => ({ ...prevState, item: clonedItem, onSubmit: addStatementToTree, open: true, type: fragmentItem.statementType, overIndex: Number(over.id), treeItems: items, refresh: refrash, setEditor: setEditor }));
        return;
      }
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }

    refrash();
  }

  function handleDragCancel() {
    resetState();
    refrash();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id: string) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: string) {

    //下記のように実行するとsetPropertyが2度実行されてしまう
    // setItems((items) =>
    //     setProperty(items, id, "collapsed", (value) => {
    //         return !value;
    //     })
    // );
    const newItems = setProperty(items, id, "collapsed", (item) => !item)
    setItems(newItems)
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25
  };
};
