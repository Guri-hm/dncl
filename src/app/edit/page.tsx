"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { SortableTree } from "../components/SortableTree";
export default function Home() {

  return (
    <div className="w-full border-solid border-2 h-dvh">
      <Allotment vertical defaultSizes={[200, 100]}>
        <SortableTree collapsible indicator removable ></SortableTree>
        <Allotment>
          <>ここにコードの結果を出力する</>
        </Allotment>
      </Allotment >
    </div>
  );
}
