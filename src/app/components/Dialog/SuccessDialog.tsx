import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FireworksEffect } from '@/app/components/Dialog';
import { useRouter } from 'next/navigation'
import { Box } from '@mui/material';
import Image from 'next/image';

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onClose, message }) => {

    const router = useRouter();
    const handleRedirect = () => {
        router.push('/chlng');
    };
    return (
        <Dialog open={open} onClose={() => { }} fullWidth maxWidth="sm">
            {open &&
                <FireworksEffect />
            }
            <DialogTitle style={{ textAlign: 'center' }}>おめでとうございます！</DialogTitle>
            <DialogContent>
                <p style={{ textAlign: 'center' }}>{message}</p>
                <Box sx={{ textAlign: 'center' }}>
                    <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/joy.webp`}
                        alt="喜ぶ女の子"
                        width={300}
                        height={300}
                        style={{ width: "80%", maxWidth: "200px", height: "auto", objectFit: "contain" }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    閉じる
                </Button>
                <Button onClick={handleRedirect} variant="outlined" color="primary" autoFocus>
                    一覧へ戻る
                </Button>
            </DialogActions>
        </Dialog>
    );
};
