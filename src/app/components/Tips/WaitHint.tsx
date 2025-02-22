import { Box } from "@mui/material"

export const WaitHint = () => {

    return (
        <Box >
            <Box>
                <p>セキュリティリスクを低減するため，多くの処理をおこなっています。</p>
                <p>ゆっくりお待ちください。</p>
            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <img src={"/break.svg"} alt='休憩' style={{ maxWidth: '150px' }}></img>
            </Box>
        </Box>
    )
}