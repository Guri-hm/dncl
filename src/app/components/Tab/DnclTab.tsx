import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { DnclScopeBox } from '@/app/components/Tab';
import styles from './tab.module.css';
import { TreeItem, TreeItems } from '@/app/types';

interface CustomBoxProps extends BoxProps {
    children?: React.ReactNode;
    treeItems: TreeItems;
}

const renderNodes = (nodes: TreeItems, depth: number): React.ReactNode => {
    return nodes.map((node: TreeItem, index: number) => (
        <React.Fragment key={node.id}>
            <Box className={(index == 0 && depth != 0) ? styles.noCounter : ""}>{node.line}
            </Box>
            {node.children.length > 0 && (
                <DnclScopeBox nested={true} depth={depth + 1}>
                    {renderNodes(node.children, depth + 1)}
                </DnclScopeBox>
            )}
        </React.Fragment>
    ))
}

export const DnclTab: React.FC<CustomBoxProps> = React.memo(({ treeItems, sx, ...props }) => {
    return (
        <Box className={styles.codeContainer} sx={{ ...sx }} {...props}>
            {renderNodes(treeItems, 0)}
        </Box>
    );
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});

DnclTab.displayName = 'DnclTab';