"use client"

import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { useState } from "react";
import DropComponent from "../test/DropComponent";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from 'uuid'
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import DragComponent from "../test/DragComponent";
export default function Home() {
  // ドロップできる領域に表示される要素のデータ用のState
  const [elms, setElms] = useState<{ id: string, name: string }[]>([])
  // ドラック中の要素データ用のState
  const [activeElm, setActiveElm] = useState<{ id: string, name: string, virtualId?: string }>()
  // ドラックする要素がドロップ領域のものかを判定するState
  const [isDropContent, setIsDropContent] = useState(false)
  // ドラックする方向の制約を管理するState
  // 基本的に「@dnd-kit/modifiers」モジュール内の値を付与する
  const [modifiers, setModifiers] = useState<Modifier[]>([])
  // ドラッグ開始時に発火する関数
  const handleDragStart = (event: DragStartEvent) => {
    // ドラックした要素に関わるイベントを取得
    const { active } = event;
    // ドラックした要素がドロップ領域に存在するかを判定する
    const isExistInDropContent = elms.map((i) => i.id).includes(active.id.toString());
    //ドラッグした要素のid作成。ドロップ領域に存在しない場合は、新規でidを作成する
    const id = isExistInDropContent ? active.id.toString() : uuidv4();
    // ドラック中にドロップ領域内で仮生成される要素のID。ドロップ領域内のものをドラックしているときはundefined
    const virtualId = isExistInDropContent ? undefined : uuidv4();
    setActiveElm({ id, name: active.data.current?.name, virtualId })
    setIsDropContent(isExistInDropContent)
    // ドラックした要素がドロップ領域内のものの場合、動かせる方向を垂直方向のみに制限する
    isExistInDropContent ? setModifiers([restrictToVerticalAxis]) : setModifiers([])
  };
  // ドラック終了時に発火する関数
  const handleDragEnd = (e: DragEndEvent) => {
    // 値をリセットする。
    // Stateのset関数は非同期なので、ここで値をリセットしても関数内の処理には影響ない。
    setActiveElm(undefined)
    // ドロップ領域のイベント(over)を取得。
    const { over } = e;
    // 何もドラックしていない場合や、ドロップ領域外でドラックを辞めた場合処理を中断する。
    if (!over || !activeElm) {
      setElms(() => elms.filter((elm) => elm.id !== activeElm?.virtualId))
      return
    };
    // 仮要素を実際の要素として、ドロップ領域内へ反映させている
    setElms(() => elms.map((elm) => ({
      id: elm.id === activeElm.virtualId ? activeElm.id : elm.id,
      name: elm.name
    })))
    // ドロップ領域内の要素をドラックしていた場合、ドロップ領域内の要素を並べ替える
    if (elms.some((elm) => elm.id === activeElm.id)) {
      setElms((items) => {
        const oldIndex = items.map((i) => i.id).findIndex((val) => val === activeElm.id)
        const newIndex = items.map((i) => i.id).findIndex((val) => val === over.id)
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  const handleDragOver = (e: DragOverEvent) => {
    const { over } = e;
    //ドロップした場所にあった要素のid
    const overId = over?.id;
    // 何もドラックしていない場合や、ドロップ領域外でドラックした要素を動かしている場合処理を中断する。
    if (!overId || !activeElm) {
      // 生成した仮要素を削除する
      setElms(() => elms.filter((elm) => elm.id !== activeElm?.virtualId));
      return;
    };
    // ドラック要素がドロップ領域内に入ったら要素を追加する
    if (activeElm.virtualId && !elms.some((elm) => elm.id === activeElm.virtualId)) {
      setElms([...elms.slice(0, elms.length), { id: activeElm.virtualId, name: e.active.data.current?.name }])
    }
    // 仮の要素をドロップ領域内に動かしている時に、位置を変更する。
    if (elms.some((elm) => elm.id === activeElm.virtualId)) {
      setElms((items) => {
        const oldIndex = items.map((i) => i.id).findIndex((val) => val === activeElm.virtualId)
        const newIndex = items.map((i) => i.id).findIndex((val) => val === over.id)
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  return (
    <>
      <div style={{ display: 'flex' }}>
        <DndContext modifiers={modifiers} onDragEnd={(e) => handleDragEnd(e)} onDragOver={(e) => handleDragOver(e)} onDragStart={(e) => handleDragStart(e)}>
          <DropComponent elms={elms} isDropContent={isDropContent} activeElmId={activeElm?.virtualId}>
          </DropComponent>
          <DragComponent></DragComponent>
        </DndContext>
      </div>
    </>
  )
}