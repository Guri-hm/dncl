import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { NextImage } from '@/app/components/NextImage';

const steps = [
    {
        label: '大学共通テストの疑似言語「DNCL」を体験できます',
        description: `処理工程を一つずつ作成し，計算結果などを確認できます。ただし，複雑な処理には対応させていません。`,
        imgPath: `${process.env.NEXT_PUBLIC_BASE_PATH}/girl_turning_around.svg`,
        width: '50%'
    },
    {
        label: 'アイテムをリストにドロップしましょう',
        description:
            '配置は後でも変更できます。アイテムの並び替えたり，追加したりするたびにプログラムが解析されます。エラーがなければ自動で実行されます。結果は「表示文」で確認しましょう。',
        imgPath: `${process.env.NEXT_PUBLIC_BASE_PATH}/drapdrop.gif`,
        width: '100%'
    },
    {
        label: 'アイテムを編集しましょう',
        description: `値などはアイテムの追加時に編集します。誤ったアイテムを追加した場合は，削除してもう一度追加しましょう。`,
        imgPath: `${process.env.NEXT_PUBLIC_BASE_PATH}/dialog.png`,
        width: '100%'
    },
    {
        label: '早速操作してみましょう',
        description: `教科書などに掲載されたプログラムを作成し，DNCLを学びましょう。`,
        imgPath: `${process.env.NEXT_PUBLIC_BASE_PATH}/goodluck.svg`,
        width: '70%'
    },
];

export const InfoStepper = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const maxSteps = steps.length;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
            <Paper
                square
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 50,
                    pl: 2,
                    bgcolor: 'background.default',
                }}
            >
                <Typography>{steps[activeStep].label}</Typography>
            </Paper>
            {steps[activeStep].imgPath && (
                <Box sx={{ height: 255, maxWidth: 400, width: steps[activeStep].width ? steps[activeStep].width : '80%', p: 2, marginX: 'auto' }}>
                    <NextImage src={steps[activeStep].imgPath} alt={steps[activeStep].label} />
                </Box>
            )}
            <Box sx={{ maxWidth: 400, width: '100%', p: 2 }}>
                {steps[activeStep].description}
            </Box>
            <MobileStepper
                variant="dots"
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                    <Button
                        size="small"
                        onClick={handleNext}
                        disabled={activeStep === maxSteps - 1}
                    >
                        Next
                        {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeft />
                        ) : (
                            <KeyboardArrowRight />
                        )}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        {theme.direction === 'rtl' ? (
                            <KeyboardArrowRight />
                        ) : (
                            <KeyboardArrowLeft />
                        )}
                        Back
                    </Button>
                }
            />
        </Box>
    );
}
