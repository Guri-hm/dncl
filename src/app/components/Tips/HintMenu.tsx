import React, { useState } from 'react';
import { List, ListItem, ListItemText, Box, Button, Divider } from '@mui/material';
import { AssignmentHint, OutputHint, WaitHint, ArrayHint, IfHint, VariableHint, IndentHint } from '@/app/components/Tips';
import Image from 'next/image';

export const HintMenu = () => {
    const [selectedItem, setSelectedItem] = useState<number | null>(null);

    const menuItems = [
        { id: 1, text: '変数とは？', component: <VariableHint></VariableHint> },
        { id: 2, text: '配列とは？', component: <ArrayHint></ArrayHint> },
        {
            id: 3, text: '代入文とは？「定義される前に使用されています」の場合は？', component: <AssignmentHint />
        },
        { id: 4, text: '表示文とは？変数や配列の要素を確認するためには？', component: <OutputHint /> },
        { id: 5, text: '条件分岐文とは？', component: <IfHint></IfHint> },
        { id: 6, text: 'インデントに気をつける', component: <IndentHint></IndentHint> },
        { id: 7, text: 'コンソールにすぐ表示されない', component: <WaitHint></WaitHint> },
    ];

    const handleClick = (id: number) => {
        setSelectedItem(id);
    };

    const handleClose = () => {
        setSelectedItem(null);
    };

    return (
        <Box sx={{ width: { xs: '90%', md: '50%' }, height: '100%', maxWidth: '600px' }}>
            {selectedItem === null ? (
                <>
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
                    <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/want_a_hint.svg`}
                            alt="ヒントがほしい"
                            layout="responsive"
                            width={300}
                            height={300}
                            style={{ width: "100%", maxWidth: "150px" }}
                        />
                    </Box>
                </>

            ) : (
                <Box sx={{ display: 'block', paddingBottom: '30px' }}>
                    {menuItems.find(item => item.id === selectedItem)?.component}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button variant="contained" sx={{ flex: 1, backgroundColor: 'var(--slate-900)' }} onClick={handleClose}>
                            閉じる
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

