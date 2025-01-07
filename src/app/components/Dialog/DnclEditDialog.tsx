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
import { keyPrefixEnum, processEnum } from './Enum';
import { ArithmeticOperatorDncl, ArithmeticOperatorJs, BooleanDncl, BooleanJpDncl, ComparisonOperatorDncl, ComparisonOperatorJs, OperatorEnum, ReturnFuncDncl, ReturnFuncJpDncl, StatementEnum, UserDefinedFuncDncl, UserDefinedFuncJpDncl, VoidFuncDncl, VoidFuncJpDncl } from '@/app/enum';
import { checkBraketPair, cnvAndOrToJsOperator, cnvObjToArray, cnvToDivision, escapeHtml, filterUserDefineFunc, flattenTreeItems, getOperandsMaxIndex, isValidExpression, replaceToAmpersand, sanitizeInput, transformNegation, tryParseToJsFunction, updateToWithSquareBrackets, ValidateObjValue } from '@/app/utilities';
import { getEnumIndex } from "@/app/utilities";
import { ErrorMsgBox } from './ErrorMsgBox';

interface Props extends DnclEditorProps { };

const getOperator = (statementType: StatementEnum) => {

    switch (statementType) {
        case StatementEnum.Input:
            return OperatorEnum.SimpleAssignment;
        default:
            return "";
    }
}

export function DnclEditDialog(params: Props) {

    const [error, setError] = useState<string[]>([]);

    const checkStatement = (data: { [k: string]: string; }, proceccType: processEnum, keyword: keyPrefixEnum, treeItems: TreeItems): boolean => {

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

        statement = cnvAndOrToJsOperator(statement);
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
                .replace(ComparisonOperatorJs.EqualToOperator, ComparisonOperatorDncl.EqualToOperator)
                .replace(ComparisonOperatorJs.NotEqualToOperator, ComparisonOperatorDncl.NotEqualToOperator)
                .replace(ComparisonOperatorJs.GreaterThanOrEqualToOperator, ComparisonOperatorDncl.GreaterThanOrEqualToOperator)
                .replace(ComparisonOperatorJs.LessThanOrEqualToOperator, ComparisonOperatorDncl.LessThanOrEqualToOperator)
                .replace(ArithmeticOperatorJs.MultiplicationOperator, ArithmeticOperatorDncl.MultiplicationOperator)
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
                        const processEnumArray = Object.values(processEnum);
                        const getValueByIndex = (index: number): string => {
                            if (index < 0 || index >= processEnumArray.length) {
                                return '';
                            }
                            return processEnumArray[index];
                        }

                        const processType = getValueByIndex(formJson.processIndex)

                        //存在しない処理の場合は実行させない
                        if (processType == '') {
                            return;
                        }
                        if (!checkStatement(formJson, processType as processEnum, keyPrefixEnum.LeftSide, params.treeItems)) return;
                        if (!checkStatement(formJson, processType as processEnum, keyPrefixEnum.RigthSide, params.treeItems)) return;

                        setError([]);

                        const operator = getOperator(params.type);
                        const leftside = getDnclStatement(formJson, keyPrefixEnum.LeftSide);
                        const rightside = getDnclStatement(formJson, keyPrefixEnum.RigthSide);

                        let processPhrase = "";
                        switch (Number(formJson.processIndex)) {
                            case getEnumIndex(processEnum, processEnum.SetValToVariableOrArray):
                            case getEnumIndex(processEnum, processEnum.InitializeArray):
                                processPhrase = `${leftside} ${operator} ${rightside}`;
                                break;
                            case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                                processPhrase = `${leftside}のすべての要素に${rightside}を代入する`;
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
                                processPhrase = `を実行し，そうでなくもし${rightside}ならば`;
                                break;

                            case getEnumIndex(processEnum, processEnum.Else):
                                processPhrase = `を実行し，そうでなければ`;
                                break;

                            case getEnumIndex(processEnum, processEnum.EndIf):
                                processPhrase = `を実行する`;
                                break;
                            case getEnumIndex(processEnum, processEnum.While):
                                processPhrase = `${rightside}の間，`;
                                break;
                            case getEnumIndex(processEnum, processEnum.EndWhile):
                            case getEnumIndex(processEnum, processEnum.EndFor):
                                processPhrase = `を繰り返す`;
                                break;
                            case getEnumIndex(processEnum, processEnum.DoWhile):
                                processPhrase = `繰り返し，`;
                                break;
                            case getEnumIndex(processEnum, processEnum.EndDoWhile):
                                processPhrase = `を，${rightside}になるまで実行する`;
                                break;
                            case getEnumIndex(processEnum, processEnum.ForIncrement):
                            case getEnumIndex(processEnum, processEnum.ForDecrement):
                                processPhrase = `${rightside}を${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.InitialValue}`]}から${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.EndValue}`]}まで${formJson[`${keyPrefixEnum.RigthSide}_${0}_${keyPrefixEnum.Difference}`]}ずつ${Number(formJson.processIndex) == getEnumIndex(processEnum, processEnum.ForIncrement) ? "増やしながら，" : "減らしながら，"}`;

                                break;
                            case getEnumIndex(processEnum, processEnum.DefineFunction):
                                processPhrase = `関数 ${rightside}を`;
                                break;
                            case getEnumIndex(processEnum, processEnum.Defined):
                                processPhrase = `と定義する`;
                                break;
                            case getEnumIndex(processEnum, processEnum.ExecuteUserDefinedFunction):
                                processPhrase = `関数 ${rightside}を実行する`;
                                break;
                            default:
                                break;
                        }

                        params.onSubmit(params.item, processPhrase, Number(formJson.processIndex), params.overIndex);
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
