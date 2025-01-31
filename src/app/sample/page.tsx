

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
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態

  const fetchLintResults = async () => {

    try {
      const response = await fetch('/api/lint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // コードを送信
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();

      setLintResults(data.resultText);
    } catch (err: any) {
      setLintResults(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
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
      <button onClick={fetchLintResults} disabled={loading}>
        {loading ? 'Linting...' : 'Lint Code'}
      </button>
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


