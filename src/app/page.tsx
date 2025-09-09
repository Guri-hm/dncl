"use client"
import React from 'react';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { PageWrapper } from '@/app/components/PageWrapper';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BubblePaper } from '@/app/components/Bubble';
import { HeaderBar, HeaderTitle } from '@/app/components/Header';
import Image from 'next/image';
import { ThemeToggleButton } from '@/app/components/Header';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Home() {

  return (
    <PageWrapper>
      <HeaderBar>
        <HeaderTitle />
        <ThemeToggleButton sx={{ marginLeft: "auto" }} />
      </HeaderBar>
      <ContentWrapper>
        <Grid container direction={"column"} sx={{
          justifyContent: "center",
          alignItems: "center", height: '100%',
          backgroundColor: 'var(--stone-50)'
        }} >
          <Box sx={{ mb: 6, px: 2, pt: 2, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              DNCL学習アプリ
            </Typography>
            <Typography variant="body1">
              大学入試共通テストで使われる疑似言語「DNCL」を、実際にプログラミングしながら学べるWebアプリです。
            </Typography>
          </Box>
          <Grid container direction={{ xs: 'column', sm: 'row' }} spacing={3} size='auto'>
            <Grid size="grow">
              <BubblePaper href='/chlng'>
                <Typography variant="h3" sx={{
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                  whiteSpace: 'nowrap'
                }}>
                  チャレンジモード
                </Typography>
                <Typography sx={{ mb: 1.5, marginTop: 0.5 }}>課題に挑み，全問クリアを目指します</Typography>
              </BubblePaper>
            </Grid>
            <Grid size="grow">
              <BubblePaper href='/edit'>
                <Typography variant="h3" sx={{
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
                }}>
                  エディタモード
                </Typography>
                <Typography sx={{ mb: 1.5, marginTop: 0.5 }}>自由にDNCLを操作します</Typography>
              </BubblePaper>
            </Grid>
          </Grid>
          <Grid size={{ xs: 8, md: 3 }} sx={{ textAlign: 'center' }}>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/front.webp`}
              alt="女の子の真正面"
              width={300}
              height={300}
              priority
              style={{ width: "100%", maxWidth: "300px", height: "auto" }}
            />
          </Grid>
        </Grid>
      </ContentWrapper>
      <Box component="footer" sx={{ py: 1, textAlign: 'center', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <a href="https://github.com/Guri-hm/dncl" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
          <GitHubIcon sx={{ verticalAlign: 'middle', color: 'text.primary' }} />
          <span style={{ color: 'text.primary' }}>GitHub: Guri-hm/dncl</span>
        </a>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()} Guri-hm
        </Typography>
      </Box>
    </PageWrapper >
  );
}


