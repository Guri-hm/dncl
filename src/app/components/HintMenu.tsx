import React, { useState } from 'react';
import { List, ListItem, ListItemText, Box, Button, Divider } from '@mui/material';
import { AssignmentHint } from './AssignmentHint';
import { OutputHint } from './OutputHint';
import { WaitHint } from './WaitHint';
import { VariableHint } from './VariableHint';
import { ArrayHint } from './ArrayHint';

const menuItems = [
    { id: 1, text: '変数とは？', component: <VariableHint></VariableHint> },
    { id: 2, text: '配列とは？', component: <ArrayHint></ArrayHint> },
    {
        id: 3, text: '代入文とは？「定義される前に使用されています」の場合は？', component: <AssignmentHint />
    },
    { id: 4, text: '表示文とは？変数や配列の要素を確認するためには？', component: <OutputHint /> },
    { id: 5, text: 'コンソールにすぐ表示されない', component: <WaitHint></WaitHint> },
];

const HintMenu = () => {
    const [selectedItem, setSelectedItem] = useState<number | null>(null);

    const handleClick = (id: number) => {
        setSelectedItem(id);
    };

    const handleClose = () => {
        setSelectedItem(null);
    };

    return (
        <Box sx={{ width: { sm: '100%', md: '50%' }, minWidth: '500px', height: '100%' }}>
            {selectedItem === null ? (
                <List>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {index != 0 ? <Divider component='li' /> : null}
                            <ListItem onClick={() => handleClick(item.id)}>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List >

            ) : (
                <Box sx={{ width: { sm: '90%', md: '50%' }, minWidth: '500px', height: '100%', marginX: 'auto', marginTop: 2, paddingBottom: '30px' }}>
                    {menuItems.find(item => item.id === selectedItem)?.component}
                    <Box sx={{ width: '100%', textAlign: 'center', marginY: '30px' }}>
                        <Button variant="contained" sx={{ backgroundColor: 'var(--slate-900)' }} onClick={handleClose}>
                            閉じる
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default HintMenu;
