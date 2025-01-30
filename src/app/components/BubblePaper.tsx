import { Paper } from '@mui/material';
import { useState } from 'react';
import './BubblePaper.css'; // CSSファイルをインポート
import Link from 'next/link';

interface BubblePaperProps {
    children: React.ReactNode;
    top: string;
    left: string;
    href: string;
}

export default function BubblePaper({ children, top, left, href }: BubblePaperProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link href={href} passHref style={{ textDecoration: 'none' }}>
            <Paper
                className={`bubble ${hovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {children}
                <span className="arrow"></span>
            </Paper>
        </Link>
    );
}