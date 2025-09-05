import { lazy } from 'react';

// Tab系コンポーネント（重い変換処理を含む）
export const FlowTab = lazy(() => import('./Tab/FlowTab').then(module => ({ default: module.FlowTab })));
export const JsTab = lazy(() => import('./Tab/JsTab').then(module => ({ default: module.JsTab })));
export const PythonTab = lazy(() => import('./Tab/PythonTab').then(module => ({ default: module.PythonTab })));
export const VbaTab = lazy(() => import('./Tab/VbaTab').then(module => ({ default: module.VbaTab })));
export const ConsoleTab = lazy(() => import('./Tab/ConsoleTab').then(module => ({ default: module.ConsoleTab })));

// 重いコンポーネント
export const SortableTree = lazy(() => import('./SortableTree').then(module => ({ default: module.SortableTree })));
export const TabsBoxWrapper = lazy(() => import('./Tab').then(module => ({ default: module.TabsBoxWrapper })));
export const ChallengePage = lazy(() => import('./Challenge/ChallengePage'));

// ダイアログ系
export const SuccessDialog = lazy(() => import('./Dialog').then(module => ({ default: module.SuccessDialog })));
export const FireworksEffect = lazy(() => import('./Dialog/FireworksEffect'));

// Tips系
export const InfoStepper = lazy(() => import('./Tips/InfoStepper').then(module => ({ default: module.InfoStepper })));
export const Tip = lazy(() => import('./Tips').then(module => ({ default: module.Tip })));