// components/ScopeBox.tsx
import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { TreeItems } from '../types';
import ScopeBox from './DnclScopeBox';
import styles from './tab.module.css';

interface CustomBoxProps extends BoxProps {
    children?: React.ReactNode;
    treeItems: TreeItems;
}

const renderNodes = (nodes: TreeItems, depth: number): React.ReactNode => {
    return nodes.map((node, index) => (
        <React.Fragment key={node.id}>
            <Box className={(index == 0 && depth != 0) ? styles.noCounter : ""}>{node.line}
            </Box>
            {node.children.length > 0 && (
                <ScopeBox nested={true} depth={depth + 1}>
                    {renderNodes(node.children, depth + 1)}
                </ScopeBox>
            )}
        </React.Fragment>
    ))
}

export const DnclTab: React.FC<CustomBoxProps> = ({ treeItems }) => {
    return <Box className={styles.codeContainer}>
        {renderNodes(treeItems, 0)}
    </Box>
};
