

"use client"
import React, { useEffect, useState } from 'react';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';

interface Props {
  text: string;
}

export default function CnvToRomaji({ text }: Props): string {

  const [convertedText, setConvertedText] = useState<string>(text);

  useEffect(() => {
    const convertText = async () => {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict/' }));
      const romaji = await kuroshiro.convert(text, { to: 'romaji' });
      setConvertedText(romaji);
    };

    convertText();
  }, [text]);

  return convertedText;
}


