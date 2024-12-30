import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DnclEditor } from "../../types";
import { StatementName } from './StatementName';
import { StatementDesc } from './StatementDesc';
import { StatementEditor } from './StatementEditor';
import { keyPrefixEnum } from './Enum';
import { OperatorEnum, StatementEnum } from '@/app/enum';

interface Props {
    editor: DnclEditor;
    setEditor: any;
    refrash: any
}

const refineStatement = (data: { [k: string]: string; }, statementType: StatementEnum, keywordPart: keyPrefixEnum) => {
    const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keywordPart)));

    //添字は前後に[]をつける
    const updatedObj: { [k: string]: string; } = {};
    for (const key in obj) {
        if (key.includes(keyPrefixEnum.Suffix)) {
            updatedObj[key] = `[${obj[key]}]`;
        } else {
            updatedObj[key] = obj[key];
        }
    }

    const maxRigthSideIndex = Object.keys(obj)
        .filter(key => key.startsWith(`${keywordPart}_`))
        .map(key => parseInt(key.split("_")[1], 10))
        .reduce((max, current) => (current > max ? current : max), -1);

    const pushNotEmptyString = (array: string[], pushedString: string) => {
        if (pushedString == "") return;
        array.push(pushedString);
    }

    const cnvUndefinedToEmptyString = (targetString: string | undefined) => {
        if (!(targetString)) return "";
        //オブジェクト内のundefinedは文字列の'undefined'になっている
        if (targetString == 'undefined') return "";
        return targetString;
    }

    let tmp: string[] = [];
    for (let i = 0; i <= maxRigthSideIndex; i++) {
        pushNotEmptyString(tmp, cnvUndefinedToEmptyString(updatedObj[`${keywordPart}_${i}_${keyPrefixEnum.Operator}`]));
        pushNotEmptyString(tmp, cnvUndefinedToEmptyString(updatedObj[`${keywordPart}_${i}_${keyPrefixEnum.LeftOfTerm}`]));
        pushNotEmptyString(tmp, cnvUndefinedToEmptyString(updatedObj[`${keywordPart}_${i}`]));
        pushNotEmptyString(tmp, cnvUndefinedToEmptyString(updatedObj[`${keywordPart}_${i}_${keyPrefixEnum.Suffix}`]));
        pushNotEmptyString(tmp, cnvUndefinedToEmptyString(updatedObj[`${keywordPart}_${i}_${keyPrefixEnum.RightOfTerm}`]));
    }

    const statement = tmp.join('');
    return statement;
}

const getOperator = (statementType: StatementEnum) => {

    switch (statementType) {
        case StatementEnum.Input:
            return OperatorEnum.SimpleAssignment;
        default:
            return "";
    }
}

export function DnclEditDialog({ editor, setEditor, refrash, ...props }: Props) {

    const handleClickOpen = () => {
        setEditor((prevState: DnclEditor) => ({ ...prevState, open: true }));
    };

    const handleClose = () => {
        setEditor((prevState: DnclEditor) => ({ ...prevState, open: false }));
        refrash();
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
                        const leftside = refineStatement(formJson, editor.type, keyPrefixEnum.LeftSide);
                        const rightside = refineStatement(formJson, editor.type, keyPrefixEnum.RigthSide);
                        const operator = getOperator(editor.type);

                        switch (editor.type) {
                            case StatementEnum.Condition:

                            default:
                                break;
                        }
                        editor.onSubmit(editor.item, `${leftside} ${operator} ${rightside}`, editor.overIndex);
                        // console.log(`${leftside} ${operator} ${rightside}`);
                        // console.log(formJson);
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
        </React.Fragment >
    );
}
