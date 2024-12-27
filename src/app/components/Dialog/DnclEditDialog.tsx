import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Statement, DnclEditor } from "../../types";
import { StatementName } from './StatementName';
import { StatementDesc } from './StatementDesc';
import { StatementEditor } from './StatementEditor';
import { keyPrefixEnum } from './Enum';
import { OperatorEnum } from '@/app/enum';

interface Props {
    editor: DnclEditor;
    setEditor: any;
}

const refineStatement = (data: { [k: string]: any; }, keywordPart: keyPrefixEnum) => {
    const leftSideElements = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keywordPart)));
    console.log(leftSideElements);
}

const getOperator = (statementType: Statement) => {

    switch (statementType) {
        case Statement.Input:
            return OperatorEnum.SimpleAssignment;
        default:
            return "";
    }
}

export function DnclEditDialog({ editor, setEditor, ...props }: Props) {

    const handleClickOpen = () => {
        setEditor((prevState: DnclEditor) => ({ ...prevState, open: true }));
    };

    const handleClose = () => {
        setEditor((prevState: DnclEditor) => ({ ...prevState, open: false }));
    };

    return (
        <React.Fragment>
            <Dialog
                open={editor.open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const leftside = refineStatement(formJson, keyPrefixEnum.LeftSide);
                        const rightside = refineStatement(formJson, keyPrefixEnum.RigthSide);
                        const operator = getOperator(editor.type);
                        handleClose();
                    },
                }}
            >
                <DialogTitle>
                    <StatementName statementType={editor.type}></StatementName>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <StatementDesc statementType={editor.type}></StatementDesc>
                    </DialogContentText>
                    <StatementEditor statementType={editor.type}></StatementEditor>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>キャンセル</Button>
                    <Button type="submit">挿入</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
