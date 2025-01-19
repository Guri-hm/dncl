"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as babelParser from '@babel/parser';
import EvaluateComponent from '../components/EvaluateComponent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface TabProps {
  children?: React.ReactNode;
  index: number;
  label: string;
  onClick: (event: React.SyntheticEvent) => void;
}
const CustomTab = (props: TabProps) => {
  return (
    <Tab
      key={props.index}
      label={props.label}
      {...a11yProps(props.index)}
      onClick={props.onClick}
    />
  );
};

const BasicTabs = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const labels = ["Item One", "Item Two", "Item Three"]

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {labels.map((label, index) => (


            <CustomTab
              key={index}
              label={label}
              index={index}
              onClick={(event) => handleChange(event, index)}
            />
          ))

          }
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}
const errorTranslations: { [key: string]: string } = {
  "Unexpected token": "予期しないトークンが見つかりました",
  "Unexpected string": "予期しない文字列が見つかりました",
  "Unexpected identifier": "予期しない識別子が見つかりました",
  "Unexpected number": "予期しない数値が見つかりました",
  "Unexpected reserved word": "予期しない予約語が見つかりました",
  "Unexpected keyword": "予期しないキーワードが見つかりました",
  "Unexpected end of input": "入力の終わりが予期されました",
  "Unterminated string constant": "文字列定数が終了していません",
  "Unexpected token, expected": "予期しないトークンが見つかりました。期待されるトークン:",
  "Duplicate declaration": "重複した宣言が見つかりました",
  "Invalid or unexpected token": "無効または予期しないトークンが見つかりました",
  "Missing semicolon": "セミコロンが欠落しています",
  "Unexpected character": "予期しない文字が見つかりました",
  "Expected '===' and instead saw '=='": "厳密等価演算子 '===' が必要ですが '==' が見つかりました",
  "Unexpected 'else' after 'return'": "returnの後に予期しない'else'が見つかりました",
  "Unreachable code after return statement": "return文の後に到達不能なコードがあります",
  "Unexpected console statement": "予期しないconsoleステートメントが見つかりました",
  "Function declared but not used": "関数が宣言されていますが使用されていません",
  "Block-scoped variable used before declaration": "ブロックスコープ変数が宣言前に使用されています",
  // 必要に応じて他のエラーメッセージを追加
};

const translateErrorMessage = (message: string): string => {
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (message.includes(key)) {
      console.log("aaa")
      return translation;
    }
  }
  // デバッグメッセージを追加して原因を確認
  console.warn(`未翻訳のエラーメッセージ: ${message}`);
  return message; // 訳が見つからなかった場合、元のメッセージを返す
};

const HeaderComponent: React.FC<{ onCopy: () => void }> = ({ onCopy }) => {
  return (
    <div className="flex items-center justify-center">
      <button onClick={onCopy} className="text-gray-500">
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" viewBox="0 0 24 24"><path d="M8 7l6 6 6-6"></path></svg>
      </button>
    </div>
  );
};


export default function Home() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const handleChange = (event: any) => {
    setCode(event.target.value);
  };

  const handleCheckSyntax = () => {
    try {
      const aaa = `
      function helloWorld() {
          console.log("Hello, World!");
      }
          helloWorl();
      `;
      // Babelを使ってコードをパース
      babelParser.parse(aaa, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      setError(null);
      alert('文法は正しいです。');
    } catch (err: any) {
      if (err.loc) {
        // Babelの解析エラーに対応
        const errorMessage = `エラー: ${translateErrorMessage(err.message)} (行: ${err.loc.line}, 列: ${err.loc.column})`;
        setError(errorMessage);
      } else {
        setError(`エラーが発生しました: ${translateErrorMessage(err.message)}`);
      }
    }
  };

  const cardContent = "ここにコンテンツが入ります。";
  return (
    <div style={{ border: '7px black solid', height: '100%', margin: 0, padding: 0 }}>
      <h1>JavaScript コード文法チェック</h1>
      <textarea
        rows={10}
        cols={50}
        value={code}
        onChange={handleChange}
        placeholder="ここにJavaScriptコードを入力してください"
      />
      <br />
      <button onClick={handleCheckSyntax}>文法チェック</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <EvaluateComponent></EvaluateComponent>

      <BasicTabs></BasicTabs>
    </div>
  );
}