"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { SortableTree } from "../components/SortableTree";
export default function Home() {

  return (
    <div className="w-full border-solid border-2 h-dvh">
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
