import { Box } from "@mui/material"
import ResponsiveImage from "../ResponsiveImage"

export const WaitHint = () => {

    return (
        <Box >
            <Box>
                <p>セキュリティリスクを低減するため，多くの処理をおこなっています。</p>
                <p>ゆっくりお待ちください。</p>
            </Box>
            <ResponsiveImage
                src={`${process.env.NEXT_PUBLIC_BASE_PATH}/break.svg`}
                alt="休憩する女の子" maxWidth={200}
            />
        </Box>
    )
}