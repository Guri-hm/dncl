import React, { RefObject, useEffect, forwardRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Swiper as SwiperInstance } from 'swiper'

interface Props {
    children?: React.ReactNode;
    labels: string[];
    specialElementsRefs?: RefObject<HTMLDivElement | null>[];
}

const SwiperTabs = forwardRef<HTMLDivElement, Props>(({ children, labels, specialElementsRefs }, ref) => {
    const [value, setValue] = useState<number>(0);
    const [bottomSwiper, setBottomSwiper] = useState<SwiperInstance | null>(null);

    const slideChange = (swiper: SwiperInstance) => {
        setValue(swiper.activeIndex);
    };

    const tabChange = (event:  React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        bottomSwiper?.slideTo(newValue);
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
            if (bottomSwiper) {
                bottomSwiper.allowTouchMove = shouldAllowTouchMove;
            }
        };

        if (bottomSwiper && bottomSwiper.el) {
            bottomSwiper.el.addEventListener('touchstart', handleTouchStart, { passive: true });
        }

        return () => {
            if (bottomSwiper && bottomSwiper.el) {
                bottomSwiper.el.removeEventListener('touchstart', handleTouchStart);
            }
        };
    }, [bottomSwiper, specialElementsRefs]);

    const handleTouchEnd = (swiper: SwiperInstance) => {
        const diff = swiper.touches.diff;
        if (diff < 0) {
            if (labels.length - 1 > value) {
                setValue(value + 1);
                if (bottomSwiper) {
                    bottomSwiper.slideTo(value + 1);
                }
            }
        } else if (diff > 0) {
            if (value > 0) {
                setValue(value - 1);
                if (bottomSwiper) {
                    bottomSwiper.slideTo(value - 1);
                }
            }
        }
    };

    const handleSetFalse = (swiper: SwiperInstance) => {
        //スワイプ後にスワイプ無効化
        //デフォルトをtrueにしていると，ドラッグ可能要素の初回処理がうまく動作しない
        if (bottomSwiper) {
            bottomSwiper.allowTouchMove = false;
        }
    }

    return (
        <>
            <Box sx={{ width: "100%", bgcolor: 'var(--stone-50)', flex: '0 1 auto', }} >
                <Swiper onTouchEnd={handleTouchEnd}>
                    <SwiperSlide>
                        <Tabs value={value} onChange={tabChange} centered>
                            {labels.map((label, index) => (
                                <Tab key={index} label={label} value={index} />
                            ))}
                        </Tabs>
                    </SwiperSlide>
                </Swiper >

            </Box>
            <Swiper
                allowTouchMove={false}
                spaceBetween={50}
                slidesPerView={1}
                onSlideChange={slideChange}
                onSwiper={setBottomSwiper}
                onTouchEnd={(handleSetFalse)}
                style={{ flex: 1, height: 'calc(100% - 48px)', }}
            >
                {children}
            </Swiper >
        </>
    );
});


SwiperTabs.displayName = "SwiperTabs";

export default SwiperTabs;