

"use client"
import React from 'react';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { PageWrapper } from '@/app/components/PageWrapper';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BubblePaper } from '@/app/components/Bubble';
import { Header, HeaderItem, HeaderTitle } from '@/app/components/Header';
import Image from 'next/image';

export default function Home() {

  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
        </HeaderItem>
      </Header>
      <ContentWrapper>
        <Grid container direction={"column"} sx={{
          justifyContent: "center",
          alignItems: "center", height: '100%',
          backgroundColor: 'var(--stone-50)'
        }} >
          <Grid container direction={{ xs: 'column', sm: 'row' }} spacing={3} size='auto'>
            <Grid size="grow">
              <BubblePaper href='./chlng'>
                <Typography variant="h2" sx={{ whiteSpace: 'nowrap' }}>
                  チャレンジモード
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 1.5, marginTop: 0.5 }}>課題に挑み，全問クリアを目指します</Typography>
              </BubblePaper>
            </Grid>
            <Grid size="grow">
              <BubblePaper href='./edit'>
                <Typography variant="h2">
                  エディタモード
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 1.5, marginTop: 0.5 }}>自由にDNCLを操作します</Typography>
              </BubblePaper>
            </Grid>
          </Grid>
          <Grid size={{ xs: 8, md: 3 }} sx={{ textAlign: 'center' }}>
            {/* <img src={"/front.svg"} alt={'女の子の真正面'} style={{ width: "100%", maxWidth: "300px" }} /> */}
            <Image
              src="/front.svg"
              alt="女の子の真正面"
              width={300}
              height={300}
              priority
              style={{ width: "100%", maxWidth: "300px" }}
            />
          </Grid>
        </Grid>
      </ContentWrapper>
    </PageWrapper >
  );
}


