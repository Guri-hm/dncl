// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { TreeItems } from '../types';
import ScopeBox from './DnclScopeBox';
import styles from './tab.module.css';

interface Props {
    items: TreeItems;
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

const DnclTab: React.FC<Props> = ({ items }: Props) => {
    return <Box className={styles.codeContainer} sx={{ fontSize: '1rem', lineHeight: 1.5 }}>
        {renderNodes(items, 0)}
    </Box>
};

export default DnclTab;
