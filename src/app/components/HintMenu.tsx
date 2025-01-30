import React, { useState } from 'react';
import { List, ListItem, ListItemText, Box, Button } from '@mui/material';
import { NextImage } from './NextImage';
import Image from 'next/image';

const menuItems = [
    {
        id: 1, text: '代入文', description:
            <div style={{ width: '300%', height: '300%' }}><Image src={"/assignment.svg"} width={300} height={300} alt='代入' objectFit='contain'></Image></div>
    },
    { id: 2, text: 'アイテム 2', description: <div>アイテム 2 の説明</div> },
    { id: 3, text: 'アイテム 3', description: <div>アイテム 3 の説明</div> },
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
        <Box>
            {selectedItem === null ? (
                <>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} onClick={() => handleClick(item.id)}>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>

                </>
            ) : (
                <Box>
                    {menuItems.find(item => item.id === selectedItem)?.description}
                    <Button variant="contained" color="primary" onClick={handleClose}>
                        閉じる
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default HintMenu;
