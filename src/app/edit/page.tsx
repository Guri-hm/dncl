"use client"
import * as React from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import DragDropContext from "../components/DragDropContext";

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
