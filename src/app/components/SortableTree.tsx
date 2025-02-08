import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Allotment } from "allotment";
import { createPortal } from "react-dom";
import { DndContext, UniqueIdentifier } from '@dnd-kit/core';
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
} from "../utilities";
import { FlattenedItem, SensorContext, TreeItems, FragmentItems, FragmentItem, DnclEditorProps, DnclValidationType } from "@/app/types";
import { SortableTreeItem, FragmentsListItem, DnclEditDialog } from "../components";
import { v4 as uuidv4 } from "uuid";
import { StatementEnum, StatementJpEnum } from "@/app/enum";
import { Box } from "@mui/material";
import styles from './alloment-custom.module.css'
import cmnStyles from './common.module.css'
import { ArrowButton } from "./ArrowButton";
import "./alloment-custom.css";
import { NextImage } from "./NextImage";
import DropHere from "./DropHere";
import DoNotDrag from "./DoNotDrag";

const statementEnumMap = {
  [StatementJpEnum.Output]: StatementEnum.Output,
  [StatementJpEnum.Input]: StatementEnum.Input,
  [StatementJpEnum.Condition]: StatementEnum.Condition,
  [StatementJpEnum.ConditionalLoopPreTest]: StatementEnum.ConditionalLoopPreTest,
  [StatementJpEnum.ConditionalLoopPostTest]: StatementEnum.ConditionalLoopPostTest,
  [StatementJpEnum.SequentialIteration]: StatementEnum.SequentialIteration,
  [StatementJpEnum.UserDefinedfunction]: StatementEnum.UserDefinedfunction,
  [StatementJpEnum.ExecuteUserDefinedFunction]: StatementEnum.ExecuteUserDefinedFunction,
};


const statementItems: (keyof typeof statementEnumMap)[] = [
  StatementJpEnum.Output,
  StatementJpEnum.Input,
  StatementJpEnum.Condition,
  StatementJpEnum.ConditionalLoopPreTest,
  StatementJpEnum.ConditionalLoopPostTest,
  StatementJpEnum.SequentialIteration,
  StatementJpEnum.UserDefinedfunction,
  StatementJpEnum.ExecuteUserDefinedFunction,
];

const fragments: FragmentItems = statementItems.map((item, index) => ({
  id: uuidv4(),
  line: item,
  children: [],
  index: 0,
  parentId: null,
  depth: 0,
  statementType: statementEnumMap[item]
}));

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
  treeItems: TreeItems;
  setTreeItems: any;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
  dnclValidation: DnclValidationType,
}

export function SortableTree({
  collapsible,
  treeItems,
  setTreeItems,
  indicator,
  indentationWidth = 30, //ツリー子要素の左インデント
  removable,
  dnclValidation
}: Props) {

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [editor, setEditor] = useState<DnclEditorProps>({ addItem: null, open: false, overIndex: 0, treeItems: treeItems, setItems: setTreeItems });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //ツリー要素追加時はこの定数にアイテムが入る
  const additionItem = fragments.find(({ id }) => id == activeId);

  const flattenedItems: FlattenedItem[] = useMemo(() => {
    const flattenedTree = flattenTree(treeItems);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );
    if (additionItem) {
      //要素追加のためのドラッグと判定
      //ここで配列に入れた要素は位置移動とドロップ時の処理で消滅し、同じidをもつ要素がドラッグを受け付けなくなる
      flattenedTree.push(additionItem);
    }

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, treeItems]);

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
  const ref = useRef<any>(null);

  if (!isClient) {
    //documentオブジェクトはクライアントサイドでしか利用できないため、サーバサイドのエラーが発生する
    // サーバーサイドでは何もレンダリングしない
    return null;
  }
  return (
    <>
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
          <Allotment.Pane maxSize={50} minSize={50} className={`${styles.paneBg}`}>
            <ArrowButton setVisible={setVisible} visible={visible}></ArrowButton>
          </Allotment.Pane>
          <Allotment.Pane visible={visible} className={`${styles.leftPane} ${styles.paneBg}`} snap>
            <Box sx={{ padding: '10px' }} className={`${cmnStyles.hFull} ${cmnStyles.overflowAuto}`}>
              <DoNotDrag />
              {fragments.map(({ id, line }) => (
                <FragmentsListItem
                  key={id}
                  id={id}
                  value={line}
                />
              ))}
            </Box>
          </Allotment.Pane>

          <div className={`${cmnStyles.hFull}`} style={{ marginLeft: '17px', marginRight: '5px' }}>
            <Allotment.Pane ref={ref} className={`${styles.rightPane} ${cmnStyles.hFull} ${cmnStyles.overflowAuto}`} >
              {(flattenedItems.length > 0) || editor.open ?
                <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                  {flattenedItems.map(({ id, children, collapsed, depth, line, fixed }, index) => (
                    <SortableTreeItem
                      key={id}
                      id={id}
                      value={line}
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
                      isError={dnclValidation?.lineNum.includes(index + 1)}
                      fixed={fixed}
                    />
                  ))}
                </SortableContext>
                :
                null
              }
              <DropHere visible={!((flattenedItems.length > 0) || editor.open)} />
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
                      childCount={getChildCount(treeItems, activeId) + 1}
                      value={activeCode ? activeCode : ""}
                      indentationWidth={indentationWidth}
                    />
                  ) : null}
                </DragOverlay>,
                document.body
              )}
            </Allotment.Pane>

          </div>
        </Allotment>
      </DndContext >
    </>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId.toString());
    setOverId(activeId.toString());

    const activeItem = [...flattenedItems, ...fragments].find(({ id }) => id === activeId);

    if (activeItem) {
      setActiveCode(activeItem?.line);
    }
    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta, active }: DragMoveEvent) {
    let adjustmentVal = 0;

    //要素追加時のみドラッグ差分値を修正
    if (ref.current && additionItem) {
      const rect = ref.current.getBoundingClientRect();
      adjustmentVal = rect.left;
      // const x = active.rect.current.translated?.left ?? 0;
      // adjustmentVal = rect.left - (x - 80);
    }

    setOffsetLeft(delta.x - adjustmentVal);
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

    interface NewItemParams {
      newItem: FlattenedItem; overIndex: UniqueIdentifier;
    }

    const addItemToTree = (itemParams: NewItemParams) => {
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(treeItems));

      clonedItems.push(itemParams.newItem);
      const overIndex = clonedItems.findIndex(({ id }) => id === itemParams.overIndex);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      console.log(itemParams.overIndex)
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setTreeItems(newItems);
      refrash();
    }

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(treeItems));
      const fragmentItem: FragmentItem | undefined = fragments.find(({ id }) => id === active.id);
      // const additionItem: FlattenedItem | undefined = fragments.find(({ id }) => id === active.id);

      if (fragmentItem) {
        let clonedItem: FlattenedItem = JSON.parse(JSON.stringify(fragmentItem));
        const newId = uuidv4();

        // clonedItem.id = newId;
        // active.id = newId;
        // clonedItems.push(clonedItem);
        clonedItem = { ...clonedItem, id: newId, depth: depth, parentId: parentId }
        setEditor((prevState: DnclEditorProps) => ({ ...prevState, item: clonedItem, addItem: addItemToTree, open: true, type: fragmentItem.statementType, overIndex: over.id, treeItems: treeItems, refresh: refrash, setEditor: setEditor }));
        return;
      }
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setTreeItems(newItems);
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
    setTreeItems((items: TreeItems) => removeItem(items, id));
  }

  function handleCollapse(id: string) {

    //下記のように実行するとsetPropertyが2度実行されてしまう
    // setItems((items) =>
    //     setProperty(items, id, "collapsed", (value) => {
    //         return !value;
    //     })
    // );
    const newItems = setProperty(treeItems, id, "collapsed", (item) => !item)
    setTreeItems(newItems)
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25
  };
};
