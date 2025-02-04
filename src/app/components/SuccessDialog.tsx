import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import "../components/confetti.css";
import Confetti from 'react-confetti';

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onClose, message }) => {
    const [animate, setAnimate] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open) {
            // ダイアログが開いたときにアニメーションを開始
            setTimeout(() => {
                setAnimate(true);
                // くす玉が開いた後に紙吹雪を開始
                setTimeout(() => {
                    setShowConfetti(true);
                }, 500); // 0.5秒後に紙吹雪を開始
            }, 500); // 最初の0.5秒
        } else {
            // ダイアログが閉じられたらアニメーションをリセット
            setAnimate(false);
            setShowConfetti(false);
        }
    }, [open]);
    // ウィンドウサイズを取得（Confetti用）
    const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

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
            {showConfetti && (
                <Confetti
                    width={windowDimension.width}
                    height={windowDimension.height}
                    recycle={false}
                    numberOfPieces={300}
                />
            )}
        </Dialog>
    );
};

export default SuccessDialog;
