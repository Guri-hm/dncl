import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export const SwiperTab: React.FC = () => {
    const [swiper, setSwiper] = useState<any>(null);
    const [value, setValue] = useState<number>(0);

    const slideChange = (index: any) => {
        setValue(index.activeIndex);
    };

    const tabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
        swiper.slideTo(newValue);
    };

    return (
        <>
            <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
                <Tabs value={value} onChange={tabChange} centered>
                    <Tab label="Item One" value={0} />
                    <Tab label="Item Two" value={1} />
                    <Tab label="Item Three" value={2} />
                </Tabs>
            </Box>
            <Swiper
                spaceBetween={50}
                slidesPerView={1}
                onSlideChange={slideChange}
                onSwiper={setSwiper}
                style={{ backgroundColor: 'var(--stone-50)' }}
            >
                <SwiperSlide>Slide 1</SwiperSlide>
                <SwiperSlide>Slide 2</SwiperSlide>
                <SwiperSlide>Slide 3</SwiperSlide>
            </Swiper>
        </>
    );
};
