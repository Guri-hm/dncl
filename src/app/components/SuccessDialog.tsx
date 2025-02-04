import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import "../components/confetti.css";

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onClose, message }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (open) {
            // ダイアログが開いたときにアニメーションを開始
            setTimeout(() => {
                setAnimate(true);
            }, 500); // 最初の0.5秒
        } else {
            // ダイアログが閉じられたらアニメーションをリセット
            setAnimate(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={() => { }} fullWidth maxWidth="sm">
            <DialogTitle style={{ textAlign: 'center' }}>おめでとうございます！</DialogTitle>
            <DialogContent>
                <div className="kusudama-container">
                    <div className={`kusudama ${animate ? 'animate' : ''}`}>
                        <div className="top">
                            <div className="left"></div>
                            <div className="right"></div>
                        </div>
                        <div className="strings">
                            <div className="string left-string"></div>
                            <div className="string right-string"></div>
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center' }}>{message}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" autoFocus>
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SuccessDialog;
