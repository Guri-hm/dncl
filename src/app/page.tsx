import { Box } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <Box sx={{ height: '700px' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%', // 親要素の高さを100%に設定
        }}
      >
        <Box sx={{ flex: 1, backgroundColor: 'lightblue', overflow: 'auto' }}>
          要素1の内容が多い場合にスクロールバーが表示されます。
        </Box>
        <Box sx={{ flex: 1, backgroundColor: 'lightgreen', overflow: 'auto' }}>
          要素2の内容が多い場合にスクロールバーが表示されます。
        </Box>
        <Box sx={{ flex: 1, backgroundColor: 'lightcoral', overflow: 'auto' }}>
          要素3の内容が多い場合にスクロールバーが表示されます。
        </Box>
      </Box>
    </Box>
  );
}
