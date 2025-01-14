

"use client"
import React, { useEffect, useState } from 'react';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';
import { ESLint } from 'eslint';

export default function Home() {

  const [convertedText, setConvertedText] = useState('');
  let text = "桜さく";
  const [code, setCode] = useState('');
  const [results, setLintResults] = useState<string>('');

  const fetchLintResults = async () => {

    try {
      const res = await fetch('/api/lint');
      const data = await res.json();
      console.log(data);
      setLintResults(data.resultText);
    } catch (error) {
      console.error('Error fetching lint results:', error);
    }

  };

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
    <>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        cols={50}
        placeholder="ここにコードを入力してください"
      />
      <button onClick={fetchLintResults}>評価する</button>
      <div>
        <p>Original: {text}</p>
        <p>Converted: {convertedText}</p>
      </div>
      <div>
        {
          results
        }
      </div>
    </>
  );
}


