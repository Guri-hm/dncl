import React, { RefObject, useEffect, forwardRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { DndContext, useDraggable } from "@dnd-kit/core";

interface Props {
    children?: React.ReactNode;
    labels: string[];
    specialElementsRefs?: RefObject<HTMLDivElement | null>[];
}

const DraggableItem: React.FC = () => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: 'draggable',
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="draggable-item"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ width: '100px', height: '100px', backgroundColor: 'lightblue' }}
        >
            ドラッグできるアイテム
        </div>
    );
};

export const SwiperTabs = forwardRef<HTMLDivElement, Props>(({ children, labels, specialElementsRefs }, ref) => {
    const [swiper, setSwiper] = useState<any>(null);
    const [value, setValue] = useState<number>(0);

    const slideChange = (index: any) => {
        setValue(index.activeIndex);
    };

    const tabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
        if (swiper) {
            swiper.slideTo(newValue);
        }
    };

    useEffect(() => {
        const handleTouchStart = (event: TouchEvent) => {
            if (!specialElementsRefs) {
                return;
            }

            let shouldAllowTouchMove = true;
            for (const ref of specialElementsRefs) {
                if (ref.current && ref.current.contains(event.target as Node)) {
                    shouldAllowTouchMove = false;
                    break;
                }
            }

            if (swiper) {
                swiper.allowTouchMove = shouldAllowTouchMove;
            }
        };

        if (swiper) {
            swiper.el.addEventListener('touchstart', handleTouchStart, { passive: true });
        }

        return () => {
            if (swiper) {
                swiper.el.removeEventListener('touchstart', handleTouchStart);
            }
        };
    }, [swiper, specialElementsRefs]);

    return (
        <>
            <Box sx={{ width: "100%", bgcolor: "background.paper", flex: '0 1 auto', }}>
                <Tabs value={value} onChange={tabChange} centered>
                    {labels.map((label, index) => (
                        <Tab key={index} label={label} value={index} />
                    ))}
                </Tabs>
            </Box>
            <Swiper
                spaceBetween={50}
                slidesPerView={1}
                onSlideChange={slideChange}
                onSwiper={setSwiper}
                style={{ backgroundColor: 'var(--stone-50)', flex: 1, height: 'calc(100% - 48px)' }}
            >
                <SwiperSlide>
                    <div>ここではスワイプできる</div>
                    <DndContext>
                        <DraggableItem />
                    </DndContext>
                </SwiperSlide>
                <SwiperSlide>ここでもスワイプできる</SwiperSlide>
            </Swiper>
        </>
    );
});
