import { Fragment, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Collapse from '@mui/material/Collapse';
import { DnclEditorProps, TreeItems } from "@/app/types";
import { StatementName, StatementDesc, EditorBox, ErrorMsgBox } from '@/app/components/Dialog';
import { keyPrefixEnum } from './Enum';
import { ArithmeticOperatorDncl, ArithmeticOperator, BooleanDncl, BooleanJpDncl, ComparisonOperatorDncl, ComparisonOperator, SimpleAssignmentOperator, ReturnFuncDncl, ReturnFuncJpDncl, StatementEnum, UserDefinedFuncDncl, UserDefinedFuncJpDncl, VoidFuncDncl, VoidFuncJpDncl, ProcessEnum, BraketSymbolEnum } from '@/app/enum';
import { checkBraketPair, cnvAndOrOperator, cnvObjToArray, cnvToDivision, escapeHtml, getOperandsMaxIndex, getVariableNames, replaceToConcatenation, sanitizeInput, sanitizeJsonValues, transformNegation, tryParseToJsFunction, updateToWithSquareBrackets, ValidateObjValue, checkForLoopInfinite } from '@/app/utilities';
import * as babelParser from '@babel/parser';

type itemElms = {
    tokens: string;
    dnclStatement: string;
    variables: string[];
    isConstant: boolean;
}

const getOperator = (statementType: StatementEnum) => {
    switch (statementType) {
        case StatementEnum.Input:
            return SimpleAssignmentOperator.Dncl;
        default:
            return "";
    }
}

export function DnclEditDialog({ type = StatementEnum.Input, isEdit = false, ...params }: DnclEditorProps) {

    const [error, setError] = useState<string[]>([]);
    const [showDescription, setShowDescription] = useState(false);
    const formData = params.item?.formData;

    const checkStatement = (data: { [k: string]: string; }, keyword: keyPrefixEnum, treeItems: TreeItems): boolean => {

        //直接変換できないためUnknown型をはさむ
        const processIndexUnknown: unknown = data.processIndex;
        const processType: ProcessEnum = processIndexUnknown as ProcessEnum;

        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keyword)));
        //オペランドの数を取得
        const operandsMaxIndex = getOperandsMaxIndex(obj, keyword)
        //添字は前後に[]をつける
        const updatedObj = updateToWithSquareBrackets(obj);

        //メイン処理はここから
        let result: { errorMsgArray: string[]; hasError: boolean; };

        result = ValidateObjValue(updatedObj, operandsMaxIndex, processType, keyword, treeItems)
        if (result.hasError) {
            setError(result.errorMsgArray);
            return false;
        }

        // For文の無限ループチェック
        if (processType === ProcessEnum.ForIncrement || processType === ProcessEnum.ForDecrement) {
            const initialValue = data[`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.InitialValue}`];
            const endValue = data[`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.EndValue}`];
            const difference = data[`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Difference}`];

            if (initialValue && endValue && difference) {
                const loopResult = checkForLoopInfinite(
                    initialValue,
                    endValue,
                    difference,
                    processType === ProcessEnum.ForIncrement,
                    treeItems
                );

                if (loopResult.hasError) {
                    setError(loopResult.errorMsgArray);
                    return false;
                }
            }
        }

        const strArray: string[] = cnvObjToArray(updatedObj, operandsMaxIndex, keyword);

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
        statement = replaceToConcatenation(statement);

        // Babelを使ってコードをパース
        try {
            babelParser.parse(statement, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'],
            });
            return true;
        } catch (err) {
            const e = err as any;
            let errMsg = (e && e.message) ? String(e.message) : String(err);

            // 日本語で一行表示する方針：行・列情報は表示しない
            if (errMsg.includes('Unexpected token')) {
                // トークンを抽出して安全に表示（エスケープして可能な限り短く）
                const m = errMsg.match(/Unexpected token\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|(\S))/);
                const token = m ? (m[1] || m[2] || m[3] || m[4]) : null;
                if (token) {
                    const safe = String(token).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    errMsg = `予期しない記号「${safe}」が使われています`;
                } else {
                    errMsg = '予期しない記号が使われています';
                }
            } else {
                // その他の一般的な構文エラーは簡潔に一行で表現
                errMsg = '構文エラーが検出されました';
            }

            result.errorMsgArray.push(errMsg);
            setError(result.errorMsgArray);
            return false;
        }
    }

    const getItemElms = (data: { [k: string]: string; }, keyword: keyPrefixEnum): itemElms => {

        //直接変換できないためUnknown型をはさむ
        const processIndexUnknown: unknown = data.processIndex;
        const processType: ProcessEnum = Number(processIndexUnknown) as ProcessEnum;
        const validationProcesses: ProcessEnum[] = [
            ProcessEnum.BulkAssignToArray,
            ProcessEnum.InitializeArray,
            ProcessEnum.SetValToVariableOrArray
        ];
        //キーワードを含むオブジェクトを取得
        const obj = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.includes(keyword)));
        //オペランドの数を取得
        const operandsMaxIndex = getOperandsMaxIndex(obj, keyword)

        const sanitizedObj = sanitizeJsonValues(obj);

        let variables: string[] = [];
        // 左辺が定数かどうか
        let isConstant = false;

        //代入文の左辺に使われているものを変数名として格納(配列名も変数名として扱う)
        if (validationProcesses.includes(processType) && keyword == keyPrefixEnum.LeftSide) {
            variables = getVariableNames(sanitizedObj, operandsMaxIndex, keyword);
            isConstant = sanitizedObj[`${keyword}_0_isConstant`] === 'true';
        }

        //添字は前後に[]をつける
        const updatedObj = updateToWithSquareBrackets(sanitizedObj);
        const strArray: string[] = cnvObjToArray(updatedObj, operandsMaxIndex, keyword);
        const statement = getDnclStatement(strArray);
        const tokens = getTokens(strArray)

        return { dnclStatement: statement, tokens: tokens, variables: variables, isConstant: isConstant }
    }

    const getDnclStatement = (strArray: string[]): string => {

        //もとの配列が置換されないように別配列に入れる
        const replacedArray: string[] = [];
        for (let i = 0; i < strArray.length; i++) {
            replacedArray.push(strArray[i]
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
            )
        }

        let line = replacedArray.join(' ');
        //引数の[]の左側の半角スペースは詰める
        line = line.replace(/\s+\[/g, '[');
        line = line.replace(/,(?=\S)/g, ', ');
        return line;
    }

    const getTokens = (strArray: string[]): string => {

        let line = strArray.join(' ');
        line = cnvAndOrOperator(line);
        line = transformNegation(line);
        line = line.replace(/\s+\[/g, '[');
        line = line.replace(/,(?=\S)/g, ', ');
        //商と余りは言語ごとに処理が異なるので別途処理
        return line;
    }

    const handleClose = () => {
        setError([]);
        // ダイアログ内のフォーカスを外す
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        if (params.setEditor) {
            params.setEditor((prevState: DnclEditorProps) => ({
                ...prevState,
                open: false,
                isEdit: false // isEditフラグもリセット
            }));
        }

        if (params.refresh) {
            params.refresh();
        }
    };

    return (
        <Fragment>
            <Dialog
                open={params.open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();

                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries()) as { [key: string]: string }; // 型を明示的に指定
                            // Enumの値を配列に変換 
                            const ProcessEnumArray = Object.values(ProcessEnum);
                            const processType = formJson.processIndex as unknown as ProcessEnum;

                            //存在しない処理の場合は実行させない
                            if (processType == null || processType > ProcessEnumArray.length - 1) {
                                return;
                            }
                            if (!checkStatement(formJson, keyPrefixEnum.LeftSide, params.treeItems)) return;
                            if (!checkStatement(formJson, keyPrefixEnum.RigthSide, params.treeItems)) return;
                            setError([]);

                            const operator = getOperator(type);
                            const leftSideElms: itemElms = getItemElms(formJson, keyPrefixEnum.LeftSide);
                            const isConstant = leftSideElms.isConstant;
                            const rightSideElms: itemElms = getItemElms(formJson, keyPrefixEnum.RigthSide);
                            const leftside = leftSideElms.dnclStatement;
                            const rightside = rightSideElms.dnclStatement;

                            const variables = [...new Set([...leftSideElms.variables, ...rightSideElms.variables])];

                            let processPhrase = "";
                            let tokens: string[] = [];
                            tokens.push(leftSideElms.tokens);
                            tokens.push(rightSideElms.tokens);

                            switch (Number(formJson.processIndex)) {
                                case ProcessEnum.SetValToVariableOrArray:
                                    processPhrase = `${leftside} ${operator} ${rightside}`;
                                    break;
                                case ProcessEnum.InitializeArray:
                                    processPhrase = `${leftside} ${operator} ${BraketSymbolEnum.OpenSquareBracket}${rightside}${BraketSymbolEnum.CloseSquareBracket}`;
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
                            if (params.item) {
                                const uiState: {
                                    radioSelections: { [key: string]: string };
                                    switchStates: { [key: string]: boolean };
                                    toggleStates: { [key: string]: string };
                                } = {
                                    radioSelections: {},
                                    switchStates: {},
                                    toggleStates: {}
                                };
                                document.querySelectorAll('input[type="radio"]:checked').forEach((radio) => {
                                    const radioElement = radio as HTMLInputElement;
                                    // 動的な:r～は除外
                                    if (!radioElement.name.startsWith(':r')) {
                                        uiState.radioSelections[radioElement.name] = radioElement.value;
                                    }
                                });

                                // 隠しフィールドの状態も収集（_Typeのみ）
                                document.querySelectorAll('input[type="hidden"]').forEach((hidden) => {
                                    const hiddenElement = hidden as HTMLInputElement;
                                    if (hiddenElement.name.includes('_Type')) {
                                        uiState.radioSelections[hiddenElement.name] = hiddenElement.value;
                                    }
                                });

                                // スイッチの状態を収集
                                document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                                    const checkboxElement = checkbox as HTMLInputElement;
                                    // MUIのSwitchコンポーネントは実際のname属性がない場合があるので、親要素から推測
                                    const parentElement = checkboxElement.closest('[data-switch-name]');
                                    if (parentElement) {
                                        const switchName = parentElement.getAttribute('data-switch-name');
                                        if (switchName) {
                                            uiState.switchStates[switchName] = checkboxElement.checked;
                                        }
                                    }
                                });
                                params.item = {
                                    ...params.item,
                                    line: processPhrase,
                                    lineTokens: tokens,
                                    processIndex: Number(formJson.processIndex),
                                    statementType: type,  // ← StatementEnumを保存
                                    variables,
                                    isConstant,
                                    formData: formJson,
                                    uiState: uiState
                                }
                            }

                            // 編集モードか新規追加モードかで処理を分岐
                            if (isEdit && params.editItem && params.item) {
                                params.editItem({ editedItem: params.item, itemId: params.item.id });
                            } else if (params.addItem && params.item) {
                                params.addItem({ newItem: params.item, overIndex: params.overIndex });
                            }
                            handleClose();
                        },
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <StatementName statementType={type} />
                        {isEdit && <Box component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>（編集中）</Box>}
                        <IconButton onClick={() => setShowDescription(!showDescription)}>
                            {showDescription ? <ExpandLess /> : <HelpOutline />}
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Collapse in={showDescription}>
                        <DialogContentText sx={{ mb: 2 }}>
                            <StatementDesc statementType={type} />
                        </DialogContentText>
                    </Collapse>
                    <Box sx={{ position: 'relative' }}>
                        <EditorBox statementType={type} treeItems={params.treeItems} formData={formData}></EditorBox>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <ErrorMsgBox sx={{ display: 'flex', flexDirection: 'column' }} errorArray={error}></ErrorMsgBox>
                    <Button onClick={handleClose}>キャンセル</Button>
                    <Button variant="outlined" type="submit">
                        {isEdit ? '更新' : '決定'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment >
    );
}