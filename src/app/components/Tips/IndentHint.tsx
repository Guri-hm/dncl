import { Box } from "@mui/material"
import Image from "next/image"

export const IndentHint = () => {

    return (
        <Box >
            <Box>
                <p>条件分岐文や順次繰り返し文は，インデントをつけて記述します。</p>
                <p>このインデントとは，下図のように文の開始位置を右にずらすことです。</p>
            </Box>
            <Box sx={{ textAlign: 'center', marginX: 'auto', marginY: '10px', width: '50%' }}>
                <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/indent.webp`}
                    alt="インデント"
                    layout="responsive"
                    width={300}
                    height={300}
                    style={{ width: "100%", maxWidth: "150px" }}
                />
            </Box>
            <Box>
                <p>条件分岐文や順次繰り返し文では，文の開始・終了や条件以外は，インデントをずらすと思っていてください。</p>
                <p>プログラミング言語のなかには，Pythonのようにインデントを非常に重視するものがあります。</p>
            </Box>
        </Box>
    )
}