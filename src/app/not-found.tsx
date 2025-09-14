"use client"
import React, { useEffect } from 'react';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { PageWrapper } from '@/app/components/PageWrapper';
import { Typography, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { HeaderBar, HeaderTitle, ThemeToggleButton } from '@/app/components/Header';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Spotlight } from '@/app/components/Tips';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // 5秒後に自動リダイレクト
        const timer = setTimeout(() => {
            router.push('/'); // これで /dncl にリダイレクトされる
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    const handleRedirect = () => {
        // これで /dncl にリダイレクトされる
        router.push('/');
    };

    return (
        <PageWrapper>
            <HeaderBar>
                <HeaderTitle />
                <ThemeToggleButton sx={{ marginLeft: "auto" }} />
            </HeaderBar>
            <ContentWrapper>
                <Grid container direction={"column"} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: '100%',
                }}>
                    <Box sx={{ textAlign: 'center', maxWidth: '600px', padding: 3 }}>
                        <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto', position: 'relative', aspectRatio: '1 / 1' }}>
                            <Spotlight>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_PATH}/not-found.svg`}
                                    alt="not found"
                                    width={200}
                                    height={200}
                                    priority
                                    style={{ margin: "0 auto", display: "block" }}
                                />
                            </Spotlight>
                        </Box>
                        <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
                            404
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 2 }}>
                            ページが見つかりません
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                            お探しのページは存在しないか、移動された可能性があります。<br />
                            5秒後に自動的にトップページに移動します。
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleRedirect}
                            sx={{ mb: 2 }}
                        >
                            トップページに戻る
                        </Button>
                    </Box>
                </Grid>
            </ContentWrapper>
        </PageWrapper>
    );
}