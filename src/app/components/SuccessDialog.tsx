import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FireworksEffect from './FireworksEffect'; // エフェクトコンポーネントをインポート

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onClose, message }) => {
    return (
        <Dialog open={open} onClose={() => { }} fullWidth maxWidth="sm">
            <DialogTitle style={{ textAlign: 'center' }}>おめでとうございます！</DialogTitle>
            <DialogContent>
                {open && <FireworksEffect />} {/* エフェクトの表示 */}
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