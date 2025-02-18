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
    specialElementRef?: RefObject<HTMLDivElement | null>;
}

export const SwiperTabs = forwardRef<HTMLDivElement, Props>(({ children, labels, specialElementRef }, ref) => {
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
            if (!specialElementRef) {
                return;
            }
            if (specialElementRef.current && specialElementRef.current.contains(event.target as Node)) {
                swiper.allowTouchMove = false;
            } else {
                swiper.allowTouchMove = true;
            }
        };

        if (swiper) {
            swiper.el.addEventListener('touchstart', handleTouchStart);
        }

        return () => {
            if (swiper) {
                swiper.el.removeEventListener('touchstart', handleTouchStart);
            }
        };
    }, [swiper]);

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

