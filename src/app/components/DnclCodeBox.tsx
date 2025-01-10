// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { TreeItems } from '../types';
import ScopeBox from './ScopeBox';


interface Props {
    items: TreeItems;
}

const renderNodes = (nodes: TreeItems): React.ReactNode => {
    return nodes.map((node) => (
        <React.Fragment key={node.id}>
            <Box>{node.line}</Box>
            {node.children.length > 0 && (
                <ScopeBox nested={true}>
                    {renderNodes(node.children)}
                </ScopeBox>
            )}
        </React.Fragment>
    ))
}

const DnclCodeBox: React.FC<Props> = ({ items }: Props) => {
    return <Box sx={{ fontSize: '1rem', lineHeight: 1.5 }}>
        {renderNodes(items)}
    </Box>
};

export default DnclCodeBox;
