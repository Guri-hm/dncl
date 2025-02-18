'use client'
import React, { useEffect, useRef } from 'react';
import { SwiperTabs } from '../components/SwiperTabs';
import { SwiperSlide } from 'swiper/react';
import { Box } from '@mui/material';
import DemoComponent from './DemoComponent';

const App = () => {
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <SwiperTabs
        labels={['プログラム', 'その他']}
        specialElementsRefs={[specialElementRef1, specialElementRef2]}
      >
        <SwiperSlide>
          <Box ref={specialElementRef1}>
            <DemoComponent />
          </Box>
        </SwiperSlide>
        <SwiperSlide>
          <Box ref={specialElementRef2}>
            <p>その他のコンテンツ</p>
          </Box>
        </SwiperSlide>
      </SwiperTabs>
    </div>
  );
};

export default App;
