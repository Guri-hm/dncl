import React from 'react';
import { Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export const HeaderTitle = () => {

    return (
        <Link href={'/'} passHref style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image
                aria-hidden
                src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo.webp`}
                alt="ロゴ"
                width={50}
                height={50}
            />
            <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, marginLeft: 1 }}>
                <ruby style={{ rubyAlign: 'space-around' }}>
                    DNCL
                    <rp>（</rp><rt>ぎじげんご</rt><rp>）</rp>
                </ruby>
                いじる<ruby style={{ rubyAlign: 'space-around' }}>
                    娘
                    <rp>（</rp><rt>こ</rt><rp>）</rp>
                </ruby>
            </Typography>
        </Link>
    );
};
