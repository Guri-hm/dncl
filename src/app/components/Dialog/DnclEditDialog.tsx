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

function convertToJavaScript(str: string) {
    // 置換規則を定義
    const replacements = [
        { regex: /\s*また\s*/g, replacement: ' || ' },
        { regex: /\s*かつ\s*/g, replacement: ' && ' },
        // { regex: /でない/g, replacement: '!' }
    ];

    // 置換を適用
    replacements.forEach(({ regex, replacement }) => {
        str = str.replace(regex, replacement);
    });

    return str;
}

// 使用例
let input = "a < 1 または b = 1";
let output = convertToJavaScript(input);

console.log(output); // "a < 1 || b = 1"



function convertJapaneseLogicalExpression(expression) {
    return expression
        .replace(/でない/g, '!')
        .replace(/かつ/g, '&&')
        .replace(/または/g, '||')
        .replace(/がない/g, '=== false');
}
function replaceNegation(expression) {
    return expression.replace(/\(([^)]+)\)!/g, '!($1)');
}

// テスト
const testString = "(1 > 2)!";
const replacedString = replaceNegation(testString);

// console.log(replacedString); // 出力: !(1 > 2)

function isValidLogicalExpression(expression) {
    const validCharactersRegex = /^[\d\s()&|!><=]+$/;
    const validLogicalExpressionRegex = /^(true|false|\d+|([!()&|><=\s])+)+$/;

    const convertedExpression = convertJapaneseLogicalExpression(expression);

    // 文字列に許可された文字のみが含まれているかチェック
    if (!validCharactersRegex.test(convertedExpression)) {
        return false;
    }

    // 論理演算子と値の整合性をチェック
    if (!validLogicalExpressionRegex.test(convertedExpression)) {
        return false;
    }

    // 括弧のバランスをチェック
    let balance = 0;
    for (let char of convertedExpression) {
        if (char === '(') {
            balance++;
        } else if (char === ')') {
            balance--;
        }
        if (balance < 0) {
            return false;
        }
    }
    return balance === 0;
}

// テスト
const testExpression1 = "(1 > 2)でない かつ (3 <= 4)";
const testExpression2 = "1 または false";
const testExpression3 = "true かつ (false または !(true))";
const testExpression4 = "invalid expression";
const testExpression5 = "(1) かつ (2 > 3";

// console.log(isValidLogicalExpression(testExpression1)); // 出力: true
// console.log(isValidLogicalExpression(testExpression2)); // 出力: true
// console.log(isValidLogicalExpression(testExpression3)); // 出力: true
// console.log(isValidLogicalExpression(testExpression4)); // 出力: false
// console.log(isValidLogicalExpression(testExpression5)); // 出力: false

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

    const statement = tmp.join(' ');
    const convertedStr = convertToJavaScript(statement);
    console.log(convertedStr);
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
