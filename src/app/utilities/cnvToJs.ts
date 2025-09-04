import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "@/app/enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, tryParseToJsFunction } from "@/app/utilities";

export type NameConversionType = "romaji" | "hex";

// 日本語と非日本語を分離
export function extractJapaneseAndNonJapanese(text: string) {
    const japanesePattern = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/g;
    const japaneseMatches = text.match(japanesePattern);
    const japaneseText = japaneseMatches ? japaneseMatches.join('') : '';
    const nonJapaneseText = text.replace(japanesePattern, '');
    return {
        japanese: japaneseText,
        nonJapanese: nonJapaneseText
    };
}

export function convertToHexadecimal(str: string): string {
    return Array.from(str)
        .map(char => char.charCodeAt(0).toString(16))
        .join('');
}

export function makeVariableName(hexStr: string): string {
    return 'var_' + hexStr.replace(/[^a-zA-Z0-9_]/g, '');
}
export function makeFuncName(hexStr: string): string {
    return 'func_' + hexStr.replace(/[^a-zA-Z0-9_]/g, '');
}

export const cnvToken = (token: string): string => {
    token = cnvToDivision(token);
    const { convertedStr } = tryParseToJsFunction(token);
    return convertedStr;
}

export const cnvToJs = async (
    statement: { lineTokens: string[], processIndex: number, isConstant?: boolean },
    nameConversion: NameConversionType = "hex"
) => {
    const lineTokens: string[] = statement.lineTokens.map(token => cnvToken(token));
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
            if (statement.isConstant) {
                tmpLine = `const ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]};`
            } else {
                tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]};`
            }
            break;
        case ProcessEnum.InitializeArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${BraketSymbolEnum.OpenSquareBracket}${lineTokens[1]}${BraketSymbolEnum.CloseSquareBracket};`
            break;
        case ProcessEnum.BulkAssignToArray:
            tmpLine = `${lineTokens[0]}.fill(${lineTokens[1]});`
            break;
        case ProcessEnum.Increment:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.AdditionOperator} ${lineTokens[1]};`
            break;
        case ProcessEnum.Decrement:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.SubtractionOperator} ${lineTokens[1]};`
            break;
        case ProcessEnum.Output:
            tmpLine = `${OutputEnum.Js}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket};`
            break;
        case ProcessEnum.If:
            tmpLine = `${ConditionEnum.JsPythonIf} ${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;
        case ProcessEnum.ElseIf:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsElseIf}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;
        case ProcessEnum.Else:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsPythonElse}${BraketSymbolEnum.OpenBrace}`
            break;
        case ProcessEnum.EndIf:
            tmpLine = `${BraketSymbolEnum.CloseBrace}`
            break;
        case ProcessEnum.While:
            tmpLine = `${LoopEnum.JsPythonWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;
        case ProcessEnum.EndWhile:
        case ProcessEnum.EndFor:
        case ProcessEnum.Defined:
            tmpLine = `${BraketSymbolEnum.CloseBrace}`
            break;
        case ProcessEnum.DoWhile:
            tmpLine = `${LoopEnum.JsDoWhile}${BraketSymbolEnum.OpenBrace}`;
            break;
        case ProcessEnum.EndDoWhile:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${LoopEnum.JsPythonWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket};`;
            break;
        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            tmpLine = `${LoopEnum.JsPythonFor} ${BraketSymbolEnum.LeftBraket} ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}; ${lineTokens[0]} ${ComparisonOperator.LessThanOrEqualToOperator} ${lineTokens[2]}; ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${statement.processIndex == ProcessEnum.ForIncrement ? ArithmeticOperator.AdditionOperator : ArithmeticOperator.SubtractionOperator} ${lineTokens[3]}${BraketSymbolEnum.RigthBraket} ${BraketSymbolEnum.OpenBrace}`;
            break;
        case ProcessEnum.DefineFunction: {
            let funcName = `${lineTokens[0]}`;
            if (containsJapanese(funcName)) {
                if (nameConversion === "romaji") {
                    funcName = await cnvToRomaji(funcName);
                } else {
                    const extracted = extractJapaneseAndNonJapanese(funcName);
                    const hexStr = convertToHexadecimal(extracted.japanese);
                    const prefix = makeFuncName(hexStr);
                    funcName = prefix + extracted.nonJapanese;
                }
            }
            tmpLine = `${UserDefinedFunc.Js} ${funcName} ${BraketSymbolEnum.OpenBrace}`;
            break;
        }
        case ProcessEnum.ExecuteUserDefinedFunction: {
            let execName = `${lineTokens[0]};`;
            if (containsJapanese(execName)) {
                if (nameConversion === "romaji") {
                    execName = await cnvToRomaji(execName);
                } else {
                    const extracted = extractJapaneseAndNonJapanese(execName);
                    const hexStr = convertToHexadecimal(extracted.japanese);
                    const prefix = makeFuncName(hexStr);
                    execName = prefix + extracted.nonJapanese;
                }
            }
            tmpLine = execName;
            break;
        }
        default:
            tmpLine = '';
            break;
    }

    return tmpLine;
}