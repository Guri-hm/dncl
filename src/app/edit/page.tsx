"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { useState } from "react";
import DropComponent from "../components/DropComponent";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from 'uuid'
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import DragComponent from "../components/DragComponent";

export function DragDropContext() {
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
      <DndContext modifiers={modifiers} onDragEnd={(e) => handleDragEnd(e)} onDragOver={(e) => handleDragOver(e)} onDragStart={(e) => handleDragStart(e)}>
        <div className="relative z-10 col-span-3 bg-slate-800 rounded-xl shadow-lg xl:ml-0 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/10">
          <div className="relative flex text-slate-400 text-xs leading-6">
            <div className="mt-2 flex-none text-sky-300 border-t border-b border-t-transparent border-b-sky-300 px-4 py-1 flex items-center">DNCL</div>
            <div className="flex-auto flex pt-2 rounded-tr-xl overflow-hidden">
              <div className="flex-auto -mr-px bg-slate-700/50 border border-slate-500/30 rounded-tl"></div>
            </div>
            <div className="absolute top-2 right-0 h-8 flex items-center pr-4"><div className="relative flex -mr-2">
              <button type="button" className="text-slate-500 hover:text-slate-400"><svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-8 h-8"><path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19"></path><path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5"></path></svg></button>
            </div>
            </div>
          </div>
          <div className="relative text-white">
            <DropComponent elms={elms} isDropContent={isDropContent} activeElmId={activeElm?.virtualId}>
            </DropComponent>
          </div>
        </div>
        <DragComponent></DragComponent>
      </DndContext>
    </>
  )
}

export default function Home() {
  return (
    <div className="w-full border-solid border-2 h-dvh">
      <Allotment>
        <Allotment.Pane className="p-1" minSize={200}>
          <DragDropContext></DragDropContext>
        </Allotment.Pane>
        <Allotment.Pane snap>
          <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
            <div className="bg-gray-100 border-b rounded-t-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
              <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                Featured
              </p>
            </div>
            <div className="p-4 md:p-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Card title
              </h3>
              <p className="mt-2 text-gray-500 dark:text-neutral-400">
                With supporting text below as a natural lead-in to additional content.
              </p>
              <a className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-none focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                Card link
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </a>
            </div>
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
