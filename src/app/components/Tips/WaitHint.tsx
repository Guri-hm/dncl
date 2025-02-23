import { Box } from "@mui/material"
import Image from "next/image"

export const WaitHint = () => {

    return (
        <Box >
            <Box>
                <p>セキュリティリスクを低減するため，多くの処理をおこなっています。</p>
                <p>ゆっくりお待ちください。</p>
            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/break.svg`}
                    alt="休憩する女の子"
                    layout="responsive"
                    width={300}
                    height={300}
                    style={{ width: "100%", maxWidth: "150px" }}
                />
            </Box>
        </Box>
    )
}