// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { TreeItems } from '../types';
import ScopeBox from './ScopeBox';
import { grey } from "@mui/material/colors";
import { createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';


interface Props {
    items: TreeItems;
}

const renderNodes = (nodes: TreeItems): React.ReactNode => {
    return nodes.map((node) => (
        <React.Fragment key={node.id}>
            <div>{node.code}</div>
            {node.children.length > 0 && (
                <ScopeBox nested={true}>
                    {renderNodes(node.children)}
                </ScopeBox>
            )}
        </React.Fragment>
    ))
}

const DnclCodeBox: React.FC<Props> = ({ items }: Props) => {
    console.log(items)
    return <ScopeBox>
        {renderNodes(items)}
    </ScopeBox>
};

export default DnclCodeBox;
