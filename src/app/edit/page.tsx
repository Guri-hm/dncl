"use client"
import * as React from "react";
import ReactDOM from "react-dom";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full border-solid border-2 h-dvh">
      <Allotment>
        <Allotment.Pane className="p-1" minSize={200}>
          <div className="relative z-10 col-span-3 bg-slate-800 rounded-xl shadow-lg xl:ml-0 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/10">
            <div className="relative flex text-slate-400 text-xs leading-6"><div className="mt-2 flex-none text-sky-300 border-t border-b border-t-transparent border-b-sky-300 px-4 py-1 flex items-center">Terminal</div><div className="flex-auto flex pt-2 rounded-tr-xl overflow-hidden"><div className="flex-auto -mr-px bg-slate-700/50 border border-slate-500/30 rounded-tl"></div></div><div className="absolute top-2 right-0 h-8 flex items-center pr-4"><div className="relative flex -mr-2"><button type="button" className="text-slate-500 hover:text-slate-400"><svg fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" className="w-8 h-8"><path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19"></path><path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5"></path></svg></button></div></div></div>
            <div className="relative">

              <div className="max-w-sm">
                <label htmlFor="textarea-email-label" className="sr-only">Comment</label>
                <textarea data-hs-textarea-auto-height="" id="textarea-email-label" className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Say hi..."></textarea>
              </div>
            </div>
            <div className="max-w-sm">
              <label for="hs-autoheight-textarea" className="block text-sm font-medium mb-2 dark:text-white">Contact us</label>
              <textarea id="hs-autoheight-textarea" className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows="1" data-hs-textarea-auto-height='{
    "defaultHeight": 200
  }' placeholder="Say hi..."></textarea>
            </div>
          </div>
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
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
