import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DnclEditor } from "../../types";
import { StatementName } from './StatementName';
import { StatementDesc } from './StatementDesc';
import { EditorBox } from './EditorBox';
import { keyPrefixEnum, processEnum } from './Enum';
import { ArithmeticOperatorSymbolArrayForDncl, ArithmeticOperatorSymbolArrayForJavascript, BraketSymbolEnum, ComparisonOperatorSymbolArrayForDncl, ComparisonOperatorSymbolArrayForJavascript, OperatorEnum, StatementEnum } from '@/app/enum';
import { checkParenthesesBalance } from '@/app/utilities';
import { getEnumIndex } from "@/app/utilities";
import { ErrorMsgBox } from './ErrorMsgBox';

interface Props {
    editor: DnclEditor;
    setEditor: any;
    refrash: any
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

    const [error, setError] = useState<string[]>([]);

    const checkStatement = (data: { [k: string]: string; }, statementType: StatementEnum, keywordPart: keyPrefixEnum): boolean => {

        const convertToJavaScript = (targetString: string) => {
            // 置換規則を定義
            const replacements = [
                { regex: /\s*または\s*/g, replacement: ' || ' },
                { regex: /\s*かつ\s*/g, replacement: ' && ' },
                // { regex: /でない/g, replacement: '!' }
            ];

            // 置換を適用
            replacements.forEach(({ regex, replacement }) => {
                targetString = targetString.replace(regex, replacement);
            });

            return targetString;
        }

        const transformNegation = (targetString: string) => {
            return targetString.replace(/\(([^()]+)\)でない/g, '!($1)').replace(/([^()]+)でない/g, '!($1)');
        }

        const convertDivision = (targetString: string) => {
            // 「÷」記号を使った除算をMath.floorで包む式に変換 
            return targetString.replace(/(\w+)\s*÷\s*(\w+)/g, 'Math.floor($1 / $2)');
        }

        const checkBraketPair = (targetStringArray: string[]) => {

            let errorArray: string[] = [];

            const result: { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } = (checkParenthesesBalance(targetStringArray));

            if (!result.isBalanced) {
                if (result.balance > 0) {
                    errorArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』を追加してください`);
                } else {
                    errorArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』を追加してください`);
                }
            }
            if (!result.isCorrectOrder) {
                errorArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』の前方には対になる『 ${BraketSymbolEnum.LeftBraket} 』が必要です`);
            }
            if (result.hasEmptyParentheses) {
                errorArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』と『 ${BraketSymbolEnum.RigthBraket} 』の内側には要素が必要です`);
            }
            setError(errorArray);
            if (errorArray.length > 0) {
                return false;
            }
            return true;
        }

        const existsOperator = (targetString: string | undefined): boolean => {
            if (!(targetString)) return false;
            //オブジェクト内のundefinedは文字列の'undefined'になっている
            if (targetString == 'undefined') return false;
            return true;
        }

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keywordPart)));

        //添字は前後に[]をつける
        const updatedObj = updateObjWithSquareBrackets(obj);

        //オペランドの数を取得
        const operandsMaxIndex = Object.keys(obj)
            .filter(key => key.startsWith(`${keywordPart}_`))
            .map(key => parseInt(key.split("_")[1], 10))
            .reduce((max, current) => (current > max ? current : max), -1);

        const sanitizeInput = (targetString: string) => {
            // 許可された文字セット: アルファベット、数字、スペース、および一部の記号、日本語 
            const regex = /^[a-zA-Z0-9 ぁ-んァ-ンｧ-ﾝﾞﾟ一-龠々 \.,!?<>=!&|\+\-\*/\(\)%!""\[\]]*$/;

            // 制御文字（ASCII 0 - 31）を排除 
            const controlChars = /[\x00-\x1F]/;

            if (regex.test(targetString) && !controlChars.test(targetString)) {
                return targetString;
            } else {
                throw new Error("Invalid characters in input.");
            }
        }

        const escapeHtml = (unsafe: string) => {
            return unsafe
                // 単独の & をエスケープし、&& の前後にスペースがある場合はエスケープしない 
                .replace(/(?<!&)&(?!&)/g, "&amp;")
                // .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        const isValidExpression = (targetString: string) => {

            try {
                new Function(`return ${targetString}`);
                return true;
            } catch (e) {
                setError(["不適切な構文です"]);
                return false;
            }
        }


        //メイン処理はここから
        let result: boolean;
        for (let i = 1; i <= operandsMaxIndex; i++) {
            result = existsOperator(updatedObj[`${keywordPart}_${i}_${keyPrefixEnum.Operator}`]);
            if (!result) {
                setError(["演算子がありません"]);
                return false;
            }
        }

        let strArray: string[] = getStringArray(updatedObj, operandsMaxIndex, keywordPart);

        let statement = strArray.join(' ');
        if (statement.trim().length == 0) return true;
        result = checkBraketPair(strArray);

        if (!result) {
            setError(["括弧の位置に誤りがあります"]);
            return false;
        }

        statement = convertToJavaScript(statement);
        statement = transformNegation(statement);
        statement = convertDivision(statement);
        statement = escapeHtml(statement);

        try {
            statement = sanitizeInput(statement);
        } catch (e: any) {
            console.log(statement)
            setError(["不適切な文字が使用されています"]);
            return false;
        }
        //表示文では「と」が入るので、Function関数が実行できない
        //サニタイジング後に「と」は「&」に置換する

        const replaceToWithAmpersand = (targetString: string) => {
            return targetString.replace(/ と /g, ' & ')
        };
        statement = replaceToWithAmpersand(statement);
        //Function関数で実行し、エラーがあるかチェック
        return isValidExpression(statement);
    }

    const getStringArray = (obj: { [k: string]: string }, operandsMaxIndex: number, keywordPart: keyPrefixEnum): string[] => {

        let strArray: string[] = [];

        for (let i = 0; i <= operandsMaxIndex; i++) {
            const cnvUndefinedToEmptyString = (targetString: string | undefined) => {
                if (!(targetString)) return "";
                //オブジェクト内のundefinedは文字列の'undefined'になっている
                if (targetString == 'undefined') return "";
                return targetString;
            }
            const pushNotEmptyString = (array: string[], pushedString: string) => {
                if (pushedString == "") return;
                array.push(pushedString);
            }
            pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.Operator}`]));
            pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.LeftOfOperand}`]));

            if (cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.String}`]) == 'true') {
                pushNotEmptyString(strArray, `"${cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}`])}"`);
            } else {
                pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}`]));
            };
            pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.Suffix}`]));
            pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.RightOfOperand}`]));
            pushNotEmptyString(strArray, cnvUndefinedToEmptyString(obj[`${keywordPart}_${i}_${keyPrefixEnum.Negation}`]));
        }

        return strArray;
    }

    const updateObjWithSquareBrackets = (obj: { [k: string]: string; }) => {

        //添字は前後に[]をつける
        const updatedObj: { [k: string]: string; } = {};
        for (const key in obj) {
            if (key.includes(keyPrefixEnum.Suffix)) {
                updatedObj[key] = `[${obj[key]}]`;
            } else {
                updatedObj[key] = obj[key];
            }
        }
        return updatedObj;
    }

    const getDnclStatement = (data: { [k: string]: string; }, statementType: StatementEnum, keywordPart: keyPrefixEnum): string => {

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keywordPart)));

        //オペランドの数を取得
        const operandsMaxIndex = Object.keys(obj)
            .filter(key => key.startsWith(`${keywordPart}_`))
            .map(key => parseInt(key.split("_")[1], 10))
            .reduce((max, current) => (current > max ? current : max), -1);

        const updatedObj = updateObjWithSquareBrackets(obj);
        let strArray: string[] = getStringArray(updatedObj, operandsMaxIndex, keywordPart);

        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i]
                .replace(ComparisonOperatorSymbolArrayForJavascript.EqualToOperator, ComparisonOperatorSymbolArrayForDncl.EqualToOperator)
                .replace(ComparisonOperatorSymbolArrayForJavascript.NotEqualToOperator, ComparisonOperatorSymbolArrayForDncl.NotEqualToOperator)
                .replace(ComparisonOperatorSymbolArrayForJavascript.GreaterThanOrEqualToOperator, ComparisonOperatorSymbolArrayForDncl.GreaterThanOrEqualToOperator)
                .replace(ComparisonOperatorSymbolArrayForJavascript.LessThanOrEqualToOperator, ComparisonOperatorSymbolArrayForDncl.LessThanOrEqualToOperator)
                .replace(ArithmeticOperatorSymbolArrayForJavascript.MultiplicationOperator, ArithmeticOperatorSymbolArrayForDncl.MultiplicationOperator)
        }

        return strArray.join(' ')
    }

    const handleClose = () => {
        setEditor((prevState: DnclEditor) => ({ ...prevState, open: false }));
        refrash();
    };

    return (
        <Fragment>
            <Dialog
                open={editor.open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();

                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        if (!checkStatement(formJson, editor.type, keyPrefixEnum.LeftSide)) return;
                        if (!checkStatement(formJson, editor.type, keyPrefixEnum.RigthSide)) return;

                        const operator = getOperator(editor.type);

                        let leftside = getDnclStatement(formJson, editor.type, keyPrefixEnum.LeftSide);
                        let rightside = getDnclStatement(formJson, editor.type, keyPrefixEnum.RigthSide);

                        let processPhrase = "";
                        switch (Number(formJson.processIndex)) {
                            case getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement):
                            case getEnumIndex(processEnum, processEnum.InitializeArray):
                            case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                                processPhrase = `${leftside} ${operator} ${rightside}`;
                                break;

                            case getEnumIndex(processEnum, processEnum.Increment):
                                processPhrase = `${leftside}を${rightside}増やす`;
                                break;

                            case getEnumIndex(processEnum, processEnum.Decrement):
                                processPhrase = `${leftside}を${rightside}減らす`;
                                break;

                            case getEnumIndex(processEnum, processEnum.Output):
                                processPhrase = `${rightside}を表示する`;
                                break;

                            case getEnumIndex(processEnum, processEnum.If):
                                processPhrase = `もし${rightside}ならば`;
                                break;
                            case getEnumIndex(processEnum, processEnum.ElseIf):
                                processPhrase = `を実行し，そうでなくもし${leftside} ${operator} ${rightside}ならば`;
                                break;

                            case getEnumIndex(processEnum, processEnum.Else):
                                processPhrase = `を実行し，そうでなければ`;
                                break;

                            case getEnumIndex(processEnum, processEnum.EndIf):
                                processPhrase = `を実行する`;
                                break;

                            default:
                                return "";
                        }

                        console.log(processPhrase)
                        editor.onSubmit(editor.item, processPhrase, editor.overIndex);
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
                    <EditorBox statementType={editor.type}></EditorBox>
                </DialogContent>
                <DialogActions>
                    <ErrorMsgBox sx={{ display: 'flex', flexDirection: 'column' }} errorArray={error}></ErrorMsgBox>
                    <Button onClick={handleClose}>キャンセル</Button>
                    <Button type="submit">挿入</Button>
                </DialogActions>
            </Dialog>
        </Fragment >
    );
}
