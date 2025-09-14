import type { Metadata } from "next";
import "@/app/globals.css";
import { Suspense, lazy } from 'react';

const ClientLayout = lazy(() => import('@/app/components/ClientLayout'));

const InitialLoader = () => (
  <div className="initial-loader">
    <div className="spinner" />
  </div>
);

export const metadata: Metadata = {
  title: "ぎじげんごいじるこ",
  description: "大学共通テストの疑似言語「DNCL」で実際にプログラミングしてみましょう",
  icons: [
    { url: `${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`, type: 'image/x-icon' }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body style={{ userSelect: 'none' }}>
        <Suspense fallback={<InitialLoader />}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}