import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DnclEditorProps, TreeItems } from "../../types";
import { StatementName } from './StatementName';
import { StatementDesc } from './StatementDesc';
import { EditorBox } from './EditorBox';
import { keyPrefixEnum } from './Enum';
import { ArithmeticOperatorDncl, ArithmeticOperator, BooleanDncl, BooleanJpDncl, ComparisonOperatorDncl, ComparisonOperator, SimpleAssignmentOperator, ReturnFuncDncl, ReturnFuncJpDncl, StatementEnum, UserDefinedFuncDncl, UserDefinedFuncJpDncl, VoidFuncDncl, VoidFuncJpDncl, ProcessEnum } from '@/app/enum';
import { checkBraketPair, cnvAndOrOperator, cnvObjToArray, cnvToDivision, enumToKeyIndexObject, escapeHtml, getOperandsMaxIndex, isValidExpression, replaceToAmpersand, sanitizeInput, transformNegation, tryParseToJsFunction, updateToWithSquareBrackets, ValidateObjValue } from '@/app/utilities';
import { ErrorMsgBox } from './ErrorMsgBox';

interface Props extends DnclEditorProps { };

const getOperator = (statementType: StatementEnum) => {

    switch (statementType) {
        case StatementEnum.Input:
            return SimpleAssignmentOperator.Dncl;
        default:
            return "";
    }
}

export function DnclEditDialog(params: Props) {

    const [error, setError] = useState<string[]>([]);

    const keyIndexObject = enumToKeyIndexObject(ProcessEnum);

    const checkStatement = (data: { [k: string]: string; }, proceccType: ProcessEnum, keyword: keyPrefixEnum, treeItems: TreeItems): boolean => {

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keyword)));
        //オペランドの数を取得
        const operandsMaxIndex = getOperandsMaxIndex(obj, keyword)
        //添字は前後に[]をつける
        const updatedObj = updateToWithSquareBrackets(obj);

        //メイン処理はここから
        let result: { errorMsgArray: string[]; hasError: boolean; };

        result = ValidateObjValue(updatedObj, operandsMaxIndex, proceccType, keyword, treeItems)
        if (result.hasError) {
            setError(result.errorMsgArray);
            return false;
        }

        let strArray: string[] = cnvObjToArray(updatedObj, operandsMaxIndex, keyword);
        // console.log(updatedObj);
        // console.log(strArray);

        result = checkBraketPair(strArray);
        if (result.hasError) {
            setError(result.errorMsgArray);
            return false;
        }

        let statement = strArray.join(' ');

        if (statement.trim().length == 0) return true;

        statement = cnvAndOrOperator(statement);
        statement = transformNegation(statement);
        statement = cnvToDivision(statement);
        const cnvResult = tryParseToJsFunction(statement);

        if (cnvResult.hasError) {
            setError(cnvResult.errorMsgArray);
            return false;
        }

        statement = escapeHtml(cnvResult.convertedStr);

        if (sanitizeInput(statement) == "") {
            setError(["不適切な文字が使用されています"]);
            return false;
        }

        //サニタイジングの後で実行
        statement = replaceToAmpersand(statement);

        //Function関数で実行し、エラーがあるかチェック
        return isValidExpression(statement);
    }

    const getDnclStatement = (data: { [k: string]: string; }, keyword: keyPrefixEnum): string => {

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keyword)));
        //オペランドの数を取得
        const operandsMaxIndex = getOperandsMaxIndex(obj, keyword)
        //添字は前後に[]をつける
        const updatedObj = updateToWithSquareBrackets(obj);

        let strArray: string[] = cnvObjToArray(updatedObj, operandsMaxIndex, keyword);

        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i]
                .replace(ComparisonOperator.EqualToOperator, ComparisonOperatorDncl.EqualToOperator)
                .replace(ComparisonOperator.NotEqualToOperator, ComparisonOperatorDncl.NotEqualToOperator)
                .replace(ComparisonOperator.GreaterThanOrEqualToOperator, ComparisonOperatorDncl.GreaterThanOrEqualToOperator)
                .replace(ComparisonOperator.LessThanOrEqualToOperator, ComparisonOperatorDncl.LessThanOrEqualToOperator)
                .replace(ArithmeticOperator.MultiplicationOperator, ArithmeticOperatorDncl.MultiplicationOperator)
                .replace(ReturnFuncDncl.Square, ReturnFuncJpDncl.Square)
                .replace(ReturnFuncDncl.Exponentiation, ReturnFuncJpDncl.Exponentiation)
                .replace(ReturnFuncDncl.Random, ReturnFuncJpDncl.Random)
                .replace(ReturnFuncDncl.Odd, ReturnFuncJpDncl.Odd)
                .replace(VoidFuncDncl.Binary, VoidFuncJpDncl.Binary)
                .replace(UserDefinedFuncDncl.UserDefined, UserDefinedFuncJpDncl.UserDefined)
                .replace(BooleanDncl.True, BooleanJpDncl.True)
                .replace(BooleanDncl.False, BooleanJpDncl.False)
        }

        return strArray.join(' ')
    }
    const getTokens = (data: { [k: string]: string; }, keyword: keyPrefixEnum): string => {

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keyword)));
        //オペランドの数を取得
        const operandsMaxIndex = getOperandsMaxIndex(obj, keyword)
        //添字は前後に[]をつける
        const updatedObj = updateToWithSquareBrackets(obj);

        let strArray: string[] = cnvObjToArray(updatedObj, operandsMaxIndex, keyword);

        let line = strArray.join(' ');

        line = cnvAndOrOperator(line);
        line = transformNegation(line);
        //商と余りは言語ごとに処理が異なるので別途処理
        return line;
    }

    const handleClose = () => {
        setError([]);
        params.setEditor((prevState: DnclEditorProps) => ({ ...prevState, open: false }));
        params.refresh();
    };

    return (
        <Fragment>
            <Dialog
                open={params.open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();

                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        // Enumの値を配列に変換 
                        const ProcessEnumArray = Object.values(ProcessEnum);
                        const getValueByIndex = (index: number): number => {
                            if (index < 0 || index >= ProcessEnumArray.length) {
                                return ProcessEnum.Unknown;
                            }
                            return Number(ProcessEnumArray[index]);
                        }

                        const processType = getValueByIndex(formJson.processIndex)

                        //存在しない処理の場合は実行させない
                        if (processType == null) {
                            return;
                        }
                        if (!checkStatement(formJson, processType as ProcessEnum, keyPrefixEnum.LeftSide, params.treeItems)) return;
                        if (!checkStatement(formJson, processType as ProcessEnum, keyPrefixEnum.RigthSide, params.treeItems)) return;

                        setError([]);

                        const operator = getOperator(params.type);
                        const leftside = getDnclStatement(formJson, keyPrefixEnum.LeftSide);
                        const rightside = getDnclStatement(formJson, keyPrefixEnum.RigthSide);

                        let processPhrase = "";
                        let tokens: string[] = [];
                        tokens.push(getTokens(formJson, keyPrefixEnum.LeftSide));
                        tokens.push(params.type == StatementEnum.Input ? SimpleAssignmentOperator.Other : '');
                        tokens.push(getTokens(formJson, keyPrefixEnum.RigthSide));

                        switch (Number(formJson.processIndex)) {
                            case ProcessEnum.SetValToVariableOrArray:
                            case ProcessEnum.InitializeArray:
                                processPhrase = `${leftside} ${operator} ${rightside}`;
                                break;
                            case ProcessEnum.BulkAssignToArray:
                                processPhrase = `${leftside}のすべての要素に${rightside}を代入する`;
                                break;
                            case ProcessEnum.Increment:
                                processPhrase = `${leftside}を${rightside}増やす`;
                                break;

                            case ProcessEnum.Decrement:
                                processPhrase = `${leftside}を${rightside}減らす`;
                                break;

                            case ProcessEnum.Output:
                                processPhrase = `${rightside}を表示する`;
                                break;

                            case ProcessEnum.If:
                                processPhrase = `もし${rightside}ならば`;
                                break;
                            case ProcessEnum.ElseIf:
                                processPhrase = `を実行し，そうでなくもし${rightside}ならば`;
                                break;

                            case ProcessEnum.Else:
                                processPhrase = `を実行し，そうでなければ`;
                                break;

                            case ProcessEnum.EndIf:
                                processPhrase = `を実行する`;
                                break;
                            case ProcessEnum.While:
                                processPhrase = `${rightside}の間，`;
                                break;
                            case ProcessEnum.EndWhile:
                            case ProcessEnum.EndFor:
                                processPhrase = `を繰り返す`;
                                break;
                            case ProcessEnum.DoWhile:
                                processPhrase = `繰り返し，`;
                                break;
                            case ProcessEnum.EndDoWhile:
                                processPhrase = `を，${rightside}になるまで実行する`;
                                break;
                            case ProcessEnum.ForIncrement:
                            case ProcessEnum.ForDecrement:
                                processPhrase = `${rightside}を${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.InitialValue}`]}から${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.EndValue}`]}まで${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.Difference}`]}ずつ${Number(formJson.processIndex) == ProcessEnum.ForIncrement ? "増やしながら，" : "減らしながら，"}`;

                                tokens.push(formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.InitialValue}`]);
                                tokens.push(formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.EndValue}`]);
                                tokens.push(formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.Difference}`]);

                                break;
                            case ProcessEnum.DefineFunction:
                                processPhrase = `関数 ${rightside} を`;
                                break;
                            case ProcessEnum.Defined:
                                processPhrase = `と定義する`;
                                break;
                            case ProcessEnum.ExecuteUserDefinedFunction:
                                processPhrase = `${rightside}`;
                                break;
                            default:
                                break;
                        }
                        tokens = tokens.filter(token => token != '');
                        params.onSubmit({ newItem: params.item, statementText: processPhrase, tokens: tokens, processIndex: Number(formJson.processIndex), overIndex: params.overIndex });
                        handleClose();
                    },
                }}
            >
                <DialogTitle>
                    <StatementName statementType={params.type}></StatementName>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <StatementDesc statementType={params.type}></StatementDesc>
                    </DialogContentText>
                    <EditorBox statementType={params.type} treeItems={params.treeItems}></EditorBox>
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
