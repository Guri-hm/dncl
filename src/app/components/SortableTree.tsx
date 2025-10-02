import React, { Fragment, RefObject, useEffect, useMemo, useRef, useState } from "react";
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
} from "@/app/utilities";
import { FlattenedItem, SensorContext, TreeItems, TreeItem, FragmentItems, FragmentItem, DnclEditorProps, DnclValidationType, NewItemParams, EditItemParams } from "@/app/types";
import { DnclEditDialog } from "@/app/components/Dialog";
import { v4 as uuidv4 } from "uuid";
import { allStatementItems, statementEnumMap, StatementEnum, ProcessEnum } from "@/app/enum";
import { Box } from "@mui/material";
import styles from '@/app/components/allotment-custom.module.css'
import cmnStyles from '@/app/components/common.module.css'
import { ArrowButton } from "@/app/components/ArrowButton";
import "@/app/components/allotment-custom.css";
import { DropHere, DoNotDrag } from "@/app/components/Tips";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SlideMenu from "@/app/components/SlideMenu";
import { LineIconItem, FragmentsListItem, SortableTreeItem } from "@/app/components/TreeItem";
import { Backdrop, Paper, Typography, Checkbox, FormControlLabel, Button } from "@mui/material";

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

export const defaultFragments: FragmentItems = allStatementItems.map((item, index) => ({
  id: uuidv4(),
  line: item,
  children: [],
  index: 0,
  parentId: null,
  depth: 0,
  statementType: statementEnumMap[item]
}));

interface Props {
  collapsible?: boolean;
  treeItems: TreeItems;
  setTreeItems: (items: TreeItems) => void;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
  allowEdit?: boolean;
  dnclValidation: DnclValidationType | null,
  fragments?: FragmentItems,
  specialElementsRefs?: RefObject<HTMLDivElement | null>[];
}

export function SortableTree({
  collapsible,
  treeItems,
  setTreeItems,
  indicator,
  indentationWidth = 30, //ツリー子要素の左インデント
  removable,
  allowEdit = true,
  dnclValidation,
  fragments = defaultFragments,
  specialElementsRefs
}: Props) {

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [editor, setEditor] = useState<DnclEditorProps>({
    addItem: null,
    open: false,
    overIndex: '',
    treeItems: treeItems,
    setItems: setTreeItems
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));//600px以上
  const [openDrawer, setOpenDrawer] = React.useState(false);

  //ツリー要素追加時はこの定数にアイテムが入る
  const additionItem = fragments.find(({ id, disabled }) => id == activeId && !disabled);

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
  }, [activeId, treeItems, additionItem]);

  // 各 statementType の現在の使用数を算出（ツリー内の既存要素）
  const usedCounts = useMemo(() => {
    const map = new Map<StatementEnum, number>();
    flattenedItems.forEach(item => {
      if (item.statementType !== undefined) {
        map.set(item.statementType, (map.get(item.statementType) || 0) + 1);
      }
    });
    return map;
  }, [flattenedItems]);

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
  const ref = useRef<HTMLDivElement | null>(null);

  const leftRef = useRef<HTMLDivElement | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('dncl_showGuide');
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  });
  const [hideNext, setHideNext] = useState(false);

  function closeGuide(savePreference: boolean) {
    try {
      if (savePreference) localStorage.setItem('dncl_showGuide', 'false');
    } catch { /* ignore */ }
    setShowGuide(false);
  }

  // 編集可能かどうかを判定する関数を修正
  const canEditItem = (item: FlattenedItem): boolean => {
    if (!allowEdit || item.fixed) return false; // allowEditがfalseかfixedがtrueなら編集不可
    return !!(item.processIndex !== undefined && item.formData);
  };

  // Helper functions
  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    const frag = fragments.find(f => f.id === activeId.toString());

    if (frag) {
      // frag.statementType と frag.maxUsage から現在の使用数を参照して残りを計算
      const used = frag.statementType !== undefined ? (usedCounts.get(frag.statementType) || 0) : 0;
      const max = frag.maxUsage;
      const remaining = typeof max === 'number' ? Math.max(0, max - used) : undefined;

      // 残りが 0 の場合はドラッグ開始をキャンセル
      if (typeof remaining === 'number' && remaining === 0) {
        return;
      }
    }
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

  function handleEdit(itemId: string) {
    if (!allowEdit) return; // 編集不可の場合は何もしない
    const targetItem = flattenedItems.find(({ id }) => id === itemId);
    if (!targetItem || !targetItem.formData || targetItem.fixed) return;

    const editItemToTree = (itemParams: EditItemParams) => {
      const updatedItems = treeItems.map(item =>
        updateItemRecursively(item, itemParams.itemId, itemParams.editedItem)
      );
      setTreeItems(updatedItems);
      refrash();
    };

    // processIndexからstatementTypeを正しく取得
    let statementType: StatementEnum = StatementEnum.Input; // デフォルト値
    const getStatementTypeFromProcessIndex = (processIndex: number): StatementEnum => {
      switch (processIndex) {
        // StatementEnum.Input
        case ProcessEnum.SetValToVariableOrArray:
        case ProcessEnum.InitializeArray:
        case ProcessEnum.BulkAssignToArray:
        case ProcessEnum.Increment:
        case ProcessEnum.Decrement:
          return StatementEnum.Input;

        // StatementEnum.Output
        case ProcessEnum.Output:
          return StatementEnum.Output;

        // StatementEnum.Condition
        case ProcessEnum.If:
        case ProcessEnum.ElseIf:
        case ProcessEnum.Else:
        case ProcessEnum.EndIf:
          return StatementEnum.Condition;

        // StatementEnum.ConditionalLoopPreTest
        case ProcessEnum.While:
        case ProcessEnum.EndWhile:
          return StatementEnum.ConditionalLoopPreTest;

        // StatementEnum.ConditionalLoopPostTest
        case ProcessEnum.DoWhile:
        case ProcessEnum.EndDoWhile:
          return StatementEnum.ConditionalLoopPostTest;

        // StatementEnum.SequentialIteration
        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
        case ProcessEnum.EndFor:
          return StatementEnum.SequentialIteration;

        // StatementEnum.UserDefinedfunction
        case ProcessEnum.DefineFunction:
        case ProcessEnum.Defined:
          return StatementEnum.UserDefinedfunction;

        // StatementEnum.ExecuteUserDefinedFunction
        case ProcessEnum.ExecuteUserDefinedFunction:
          return StatementEnum.ExecuteUserDefinedFunction;

        default:
          return StatementEnum.Input;
      }
    };
    if (targetItem.processIndex !== undefined) {
      // processIndexに対応するStatementEnumを見つける
      const processIndex = targetItem.processIndex;

      // 各StatementEnumに対するprocessIndexのマッピングを確認
      Object.values(StatementEnum).forEach((enumValue) => {
        if (typeof enumValue === 'number' && enumValue === processIndex) {
          statementType = enumValue;
        }
      });
    }

    setEditor((prevState: DnclEditorProps) => ({
      ...prevState,
      item: targetItem,
      editItem: editItemToTree,
      open: true,
      type: targetItem.statementType || getStatementTypeFromProcessIndex(targetItem.processIndex || 0),
      treeItems: treeItems,
      refresh: refrash,
      setEditor: setEditor,
      isEdit: true,
      overIndex: targetItem.id
    }));
  }

  // TreeItemをFlattenedItemに変換してから再帰的に更新する関数
  function updateItemRecursively(item: TreeItem, targetId: UniqueIdentifier, newItem: FlattenedItem): TreeItem {
    if (item.id === targetId) {
      // FlattenedItemからTreeItemに必要なプロパティのみを抽出
      const { parentId, depth, index, ...treeItemProps } = newItem;
      return {
        ...treeItemProps,
        id: targetId.toString(),
        children: item.children
      };
    }

    return {
      ...item,
      children: item.children.map(child => updateItemRecursively(child, targetId, newItem))
    };
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    const addItemToTree = (itemParams: NewItemParams) => {
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(treeItems));

      clonedItems.push(itemParams.newItem);
      const overIndex = clonedItems.findIndex(({ id }) => id === itemParams.overIndex);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setTreeItems(newItems);
      refrash();
    }

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = structuredClone(flattenTree(treeItems));
      const fragmentItem: FragmentItem | undefined = fragments.find(({ id }) => id === active.id);

      if (fragmentItem) {
        let clonedItem: FlattenedItem = JSON.parse(JSON.stringify(fragmentItem));
        const newId = uuidv4();

        clonedItem = { ...clonedItem, id: newId, depth: depth, parentId: parentId }
        setEditor((prevState: DnclEditorProps) => ({
          ...prevState,
          item: clonedItem,
          addItem: addItemToTree,
          open: true,
          type: fragmentItem.statementType,
          overIndex: over.id,
          treeItems: treeItems,
          refresh: refrash,
          setEditor: setEditor,
          isEdit: false
        }));
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
    const updatedItems = removeItem(treeItems, id);
    setTreeItems(updatedItems);
  }

  function handleCollapse(id: string) {
    const newItems = setProperty(treeItems, id, "collapsed", (item) => !item)
    setTreeItems(newItems)
  }

  if (!isClient) {
    //documentオブジェクトはクライアントサイドでしか利用できないため、サーバサイドのエラーが発生する
    // サーバーサイドでは何もレンダリングしない
    return null;
  }

  const arrowCoords = (() => {
    if (!leftRef.current || !ref.current) return null;
    const l = leftRef.current.getBoundingClientRect();
    const r = ref.current.getBoundingClientRect();
    // start: center of left Box
    const start = { x: l.left + l.width / 2, y: l.top + l.height / 2 };
    // end: center-left area of right pane (a bit inset)
    const end = { x: r.left + Math.min(60, r.width * 0.2), y: r.top + r.height / 2 };

    // control points for smooth S-shaped curve
    const cx = start.x + (end.x - start.x) * 0.5;
    const control1 = { x: cx, y: start.y };
    const control2 = { x: cx, y: end.y };

    // compute mid point on cubic Bezier at t=0.5: B(0.5) = 1/8 P0 + 3/8 P1 + 3/8 P2 + 1/8 P3
    const mid = {
      x: (start.x * 0.125) + (control1.x * 0.375) + (control2.x * 0.375) + (end.x * 0.125),
      y: (start.y * 0.125) + (control1.y * 0.375) + (control2.y * 0.375) + (end.y * 0.125) - 20
    };

    // path d for cubic bezier
    const pathD = `M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`;
    return { start, end, mid, pathD };
  })();

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
        {isSm ?
          <Allotment separator={false} className={styles.splitViewContainer} onVisibleChange={(_index, value) => {
            setVisible(value);
          }}>
            <Allotment.Pane maxSize={50} minSize={50} className={`${styles.paneBg}`}>
              <ArrowButton setVisible={setVisible} visible={visible}></ArrowButton>
            </Allotment.Pane>
            <Allotment.Pane visible={visible} className={`${styles.leftPane} ${styles.paneBg}`} snap>
              <Box ref={leftRef} sx={{ padding: '10px' }} className={`${cmnStyles.hFull} ${cmnStyles.overflowAuto}`}>
                <DoNotDrag />
                {fragments.map(({ id, line, statementType, maxUsage }) => {
                  const used = statementType !== undefined ? (usedCounts.get(statementType) || 0) : 0;
                  const remaining = typeof maxUsage === 'number' ? Math.max(0, maxUsage - used) : undefined;
                  const disabled = remaining === 0;
                  return (
                    <FragmentsListItem
                      key={id}
                      id={id}
                      value={line}
                      disabled={disabled}
                      remaining={remaining}
                      maxUsage={maxUsage}
                    />
                  );
                })}
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
                        canEdit={canEditItem(flattenedItems[index])}
                        onEdit={() => handleEdit(id)}
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
                {showGuide && isClient && arrowCoords && createPortal(
                  <>
                    {/* SVG arrow (on top) */}
                    <svg
                      style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 3000, pointerEvents: 'none' }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <marker id="arrowhead" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#fff" stroke="none" />
                        </marker>
                      </defs>

                      <path
                        d={arrowCoords.pathD ?? `M ${arrowCoords.start.x} ${arrowCoords.start.y} L ${arrowCoords.end.x} ${arrowCoords.end.y}`}
                        stroke="#fff"
                        strokeWidth={3}
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                    <Backdrop open sx={{ zIndex: 2001, bgcolor: 'rgba(0,0,0,0.35)', pointerEvents: 'auto' }}>
                      <Paper
                        elevation={8}
                        sx={{
                          position: 'absolute',
                          left: arrowCoords.mid.x,
                          top: arrowCoords.mid.y,
                          transform: 'translate(-50%, -100%)',
                          p: 2,
                          maxWidth: 320,
                          pointerEvents: 'auto'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>ドラッグ＆ドロップします</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          左のブロックを右側へドラッグして追加します
                        </Typography>

                        <FormControlLabel
                          control={<Checkbox checked={hideNext} onChange={(e) => setHideNext(e.target.checked)} />}
                          label={<Typography variant="body2">次回から表示しない</Typography>}
                          sx={{ mt: 1 }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button variant="contained" color="primary" onClick={() => closeGuide(hideNext)}>閉じる</Button>
                        </Box>
                      </Paper>
                    </Backdrop>
                  </>,
                  document.body
                )}
              </Allotment.Pane>

            </div>
          </Allotment>
          :
          <>
            <SlideMenu activeId={activeId} open={openDrawer} setOpen={setOpenDrawer}>
              <Box ref={specialElementsRefs && specialElementsRefs[0]} >
                {fragments.map(({ id, line, statementType }) => (
                  <LineIconItem
                    key={id}
                    id={id}
                    value={line}
                    statementType={statementType}
                    isIcon={!openDrawer}
                  />
                ))}
              </Box>
            </SlideMenu>
            {(flattenedItems.length > 0) || editor.open ?
              <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                <Box sx={{ paddingLeft: '75px' }} ref={specialElementsRefs && specialElementsRefs[1]}>
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
                      canEdit={canEditItem(flattenedItems[index])}
                      onEdit={() => handleEdit(id)}
                      isError={dnclValidation?.lineNum.includes(index + 1)}
                      fixed={fixed}
                    />
                  ))}
                </Box>
              </SortableContext>
              :
              null}
            <DropHere visible={!((flattenedItems.length > 0) || editor.open)} />
          </>
        }
      </DndContext >
    </>
  );
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25
  };
};