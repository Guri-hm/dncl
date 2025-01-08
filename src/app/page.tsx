

"use client"
import React, { useEffect, useState } from 'react';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';

export default function Home() {

  const [convertedText, setConvertedText] = useState('');
  let text = "桜";

  useEffect(() => {
    const convertText = async () => {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict/' }));
      const romaji = await kuroshiro.convert(text, { to: 'romaji' });
      setConvertedText(romaji);
    };

    convertText();
  }, [text]);

  return (
    <div>
      <p>Original: {text}</p>
      <p>Converted: {convertedText}</p>
    </div>
  );
}


