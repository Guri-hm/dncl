'use client'
import { useEffect, useRef, useState } from 'react';
import DrawioEmbed from './DrawioEmbed';
import { SwiperTabs } from '../components/SwiperTabsTest';

const Home: React.FC = () => {

  return (
    <div>
      <SwiperTabs labels={['テスト１', 'テスト２']}></SwiperTabs>
    </div>
  );
};

export default Home;
