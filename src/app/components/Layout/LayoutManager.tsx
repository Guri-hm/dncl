import React, { FC, useEffect } from 'react';
import { LayoutConfig, PanelConfig, TabConfig } from '@/app/types/layout';
import { TreeItems, DnclValidationType } from '@/app/types';
import { DraggablePanel } from './DraggablePanel';
import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    treeItems: TreeItems;
    layoutConfig: LayoutConfig;
    onLayoutChange: (config: LayoutConfig) => void;
    dnclValidation: DnclValidationType | null;
    setDnclValidation: (validation: DnclValidationType | null) => void;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
}

export const LayoutManager: FC<Props> = React.memo(({
    treeItems,
    layoutConfig,
    onLayoutChange,
    dnclValidation,
    setDnclValidation,
    runResults,
    setRunResults
}) => {
    // デバッグ: 既存パネルの詳細を確認
    useEffect(() => {
        console.log('LayoutManager: Full layoutConfig:', layoutConfig);
        console.log('LayoutManager: All panels:');
        layoutConfig.panels.forEach((panel, index) => {
            console.log(`  Panel ${index}:`, {
                id: panel.id,
                type: panel.type,
                position: panel.position,
                tabsCount: panel.tabs.length
            });
        });
    }, [layoutConfig]);

    // パネルの分類 - より柔軟に
    const centerPanels = layoutConfig.panels.filter(p =>
        !p.position ||
        p.position === 'center' ||
        p.position === undefined ||
        p.position === null ||
        (p.type === 'tabs' && p.position !== 'bottom')
    );

    const bottomPanels = layoutConfig.panels.filter(p =>
        p.position === 'bottom' ||
        (p.type === 'console' && p.position !== 'center')
    );

    console.log('LayoutManager: centerPanels =', centerPanels.length);
    console.log('LayoutManager: bottomPanels =', bottomPanels.length);
    console.log('LayoutManager: centerPanels details:', centerPanels.map(p => ({ id: p.id, type: p.type, position: p.position })));
    console.log('LayoutManager: bottomPanels details:', bottomPanels.map(p => ({ id: p.id, type: p.type, position: p.position })));

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px'
        }}>
            {/* メインエリア */}
            <div style={{
                flex: 1,
                display: 'flex',
                gap: '8px',
                border: '2px solid red',
                minHeight: '200px'
            }}>
                {centerPanels.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        border: '1px dashed #ccc'
                    }}>
                        メインパネルがありません (全パネル数: {layoutConfig.panels.length})
                    </div>
                ) : (
                    centerPanels.map(panel => (
                        <div key={panel.id} style={{ flex: 1 }}>
                            <DraggablePanel
                                panel={panel}
                                treeItems={treeItems}
                                dnclValidation={dnclValidation}
                                setDnclValidation={setDnclValidation}
                                runResults={runResults}
                                setRunResults={setRunResults}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* 底部エリア */}
            <div style={{
                height: '200px',
                display: 'flex',
                gap: '8px',
                border: '2px solid blue',
                minHeight: '200px'
            }}>
                {bottomPanels.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        border: '1px dashed #ccc'
                    }}>
                        底部パネルがありません (全パネル数: {layoutConfig.panels.length})
                    </div>
                ) : (
                    bottomPanels.map(panel => (
                        <div key={panel.id} style={{ flex: 1 }}>
                            <DraggablePanel
                                panel={panel}
                                treeItems={treeItems}
                                dnclValidation={dnclValidation}
                                setDnclValidation={setDnclValidation}
                                runResults={runResults}
                                setRunResults={setRunResults}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* 緊急時の全パネル表示 */}
            {centerPanels.length === 0 && bottomPanels.length === 0 && layoutConfig.panels.length > 0 && (
                <div style={{
                    height: '300px',
                    border: '2px solid green',
                    padding: '8px',
                    backgroundColor: '#fff3cd'
                }}>
                    <h3>緊急表示: 全パネル</h3>
                    {layoutConfig.panels.map(panel => (
                        <div key={panel.id} style={{
                            height: '200px',
                            marginBottom: '8px',
                            border: '1px solid #ccc'
                        }}>
                            <div>パネル: {panel.type} (position: {panel.position || 'undefined'})</div>
                            <DraggablePanel
                                panel={panel}
                                treeItems={treeItems}
                                dnclValidation={dnclValidation}
                                setDnclValidation={setDnclValidation}
                                runResults={runResults}
                                setRunResults={setRunResults}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

LayoutManager.displayName = 'LayoutManager';

export default LayoutManager;