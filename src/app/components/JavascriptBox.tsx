import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, ProcessEnum, UserDefinedFuncJpDncl, UserDefinedFuncJs } from "../enum";
import { cnvToRomaji, containsJapanese, getEnumIndex } from "../utilities";
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const extractFromTreeItems = (treeItems: TreeItem[]): { code: string, processIndex: number }[] => {
    const result: { code: string, processIndex: number }[] = [];

    const traverse = (item: TreeItem) => {
        result.push({ code: item.code, processIndex: item.processIndex ?? getEnumIndex(ProcessEnum, ProcessEnum.Unknown) });
        item.children.forEach(child => traverse(child));
    };

    treeItems.forEach(item => traverse(item));
    return result;
};

const cnvToJs = async (statement: { code: string, processIndex: number }) => {

    let tmpLineString: string = statement.code;

    switch (statement.processIndex) {
        case getEnumIndex(ProcessEnum, ProcessEnum.SetValToVariableOrArray):

            break;
        case getEnumIndex(ProcessEnum, ProcessEnum.InitializeArray):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.BulkAssignToArray):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Increment):
        case getEnumIndex(ProcessEnum, ProcessEnum.Decrement):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Output):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.If):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ElseIf):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Else):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndIf):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.While):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndWhile):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DoWhile):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndDoWhile):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement):
        case getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndFor):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DefineFunction):

            //「関数」の文字列を置換
            const regexFirstWord = new RegExp(`^${UserDefinedFuncJpDncl.UserDefined}`);
            tmpLineString = tmpLineString.replace(regexFirstWord, UserDefinedFuncJs.UserDefined);
            tmpLineString = tmpLineString.replace(/を$/, BraketSymbolEnum.OpenBrace);
            if (containsJapanese(tmpLineString)) {
                console.log(tmpLineString)
                tmpLineString = await cnvToRomaji(tmpLineString);
            }
            return tmpLineString;

        case getEnumIndex(ProcessEnum, ProcessEnum.Defined):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction):
            break;

        default:
            break;

    }

    return tmpLineString;
}

export const JavascriptBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
    // console.log(treeItems)
    const dnclStatements = extractFromTreeItems(treeItems);
    // console.log(codeValues)
    // const romajiFromHiragana = wanakana.toRomaji("あいうえお");
    // const aaa = wanakana.toRomaji("apple()");
    // console.log(romajiFromHiragana)

    const [codeLines, setCodeLines] = useState<string[]>(['変換中']);

    useEffect(() => {
        const convertCode = async () => {
            if (dnclStatements) {

                let jsCodeLines = [];
                for (let i = 0; i < dnclStatements.length; i++) {
                    const jsLine = await cnvToJs(dnclStatements[i])
                    jsCodeLines.push(jsLine);

                }

                setCodeLines(jsCodeLines);
            }
        };
        convertCode();
    }, [dnclStatements]);


    return (
        <Box sx={{
            ...sx,
        }} {...props} >
            {codeLines.map((line: string, index: number) => (

                <div key={index}>{line}</div>

            ))}
        </Box>
    );
};
