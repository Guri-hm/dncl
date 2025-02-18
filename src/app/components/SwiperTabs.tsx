import React, { RefObject, useEffect, forwardRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from '@mui/material/Grid2';

interface Props {
    children?: React.ReactNode;
    labels: string[];
    specialElementsRefs?: RefObject<HTMLDivElement | null>[];
}

export const SwiperTabs = forwardRef<HTMLDivElement, Props>(({ children, labels, specialElementsRefs }, ref) => {
    const [swiper, setSwiper] = useState<any>(null);
    const [value, setValue] = useState<number>(0);

    const slideChange = (index: any) => {
        setValue(index.activeIndex);
    };

    const tabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
        swiper.slideTo(newValue);
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
                    console.log("スワイプ禁止")
                    break;
                }
            }

            swiper.allowTouchMove = shouldAllowTouchMove;
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
                style={{ backgroundColor: 'var(--stone-50)', flex: 1, height: 'calc(100% - 48px)', }}
            >
                {children}
            </Swiper >
        </>
    );
});

