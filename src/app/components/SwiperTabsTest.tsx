import React, { useRef, useEffect } from 'react';
import Swiper from 'swiper';
import { DndContext, useDraggable, DragStartEvent, DragEndEvent } from '@dnd-kit/core';

interface DraggableItemProps {
    id: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
    });

    const style: React.CSSProperties = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                width: '100px',
                height: '100px',
                backgroundColor: 'lightblue',
                cursor: 'move',
            }}
            {...listeners}
            {...attributes}
        >
            ドラッグ可能な要素
        </div>
    );
};

const MySwiper: React.FC = () => {
    const swiperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const swiperInstance = new Swiper(swiperRef.current!, {
            // Swiperの設定
            allowTouchMove: false, // スワイプを無効化
        });

        return () => {
            swiperInstance.destroy(true, true);
        };
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        console.log('Drag started:', event);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        console.log('Drag ended:', event);
    };

    return (
        <div ref={swiperRef} className="swiper-container">
            <div className="swiper-wrapper">
                <div className="swiper-slide">
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <DraggableItem id="item1" />
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default MySwiper;
