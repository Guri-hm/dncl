"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "../components/alloment-custom.css";
import { SortableTree } from "../components/SortableTree";
export default function Home() {

  return (
    <div className="w-full border-solid border-2 h-dvh bg-slate-800 rounded-xl overflow-hidden">
      <div className="relative flex text-slate-400 text-xs leading-6">
        <div className="mt-2 flex-none text-sky-300 px-4 py-1 flex items-center">どんな ニーズも カバーしちゃう ロジック！ ⇒ DNCL</div>
      </div>
      <Allotment vertical defaultSizes={[200, 100]}>
        <Allotment.Pane>
          <SortableTree collapsible indicator removable ></SortableTree>
        </Allotment.Pane>
        <Allotment.Pane>
          <>ここにコードの結果を出力する</>
        </Allotment.Pane>
      </Allotment >
    </div >
  );
}
