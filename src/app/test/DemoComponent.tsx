import React from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

const Item: React.FC<{ id: string; text: string }> = ({ id, text }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '8px',
        border: '1px solid #ccc',
        marginBottom: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {text}
        </div>
    );
};

const SortableList: React.FC<{ items: { id: string; text: string }[]; onItemsChange: (items: { id: string; text: string }[]) => void }> = ({ items, onItemsChange }) => {
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            onItemsChange(newItems);
        }
    };
    const handleDragStart = (event: any) => {
        console.log('start')
    };

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                    <Item key={item.id} id={item.id} text={item.text} />
                ))}
            </SortableContext>
        </DndContext>
    );
};

const DemoComponent = () => {
    const [items, setItems] = React.useState([
        { id: '1', text: 'Item 1' },
        { id: '2', text: 'Item 2' },
        { id: '3', text: 'Item 3' },
    ]);

    return (
        <Box sx={{ padding: '16px' }}>
            <SortableList items={items} onItemsChange={setItems} />
        </Box>
    );
};

export default DemoComponent;