import { Box, BoxProps } from "@mui/material";
import { FC, useEffect } from "react";
import { TreeItem, TreeItems } from "../types";
import * as wanakana from 'wanakana';
import { ProcessEnum, UserDefinedFuncJpDncl, UserDefinedFuncJs } from "../enum";
import { getEnumIndex } from "../utilities";
import kuromoji from 'kuromoji';

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

const cnvToJs = (statement: { code: string, processIndex: number }): string => {


    let cnvedCode: string = statement.code;


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

            // cnvedCode = cnvedCode.replace(UserDefinedFuncJpDncl.UserDefined, UserDefinedFuncJs.UserDefined)
            cnvedCode = cnvedCode.replace(/[\u3040-\u30ff]+/g, (match) => wanakana.toRomaji(match));
            console.log(cnvedCode)
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Defined):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction):
            break;

        default:
            break;

    }

    return cnvedCode;
}

export const JavascriptBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
    // console.log(treeItems)
    const codeValues = extractFromTreeItems(treeItems);
    // console.log(codeValues)
    // const romajiFromHiragana = wanakana.toRomaji("あいうえお");
    // const aaa = wanakana.toRomaji("apple()");
    // console.log(romajiFromHiragana)



    return (
        <Box sx={{
            ...sx,
        }} {...props} >
            {codeValues.map((statement: { code: string, processIndex: number }, index: number) => (

                <div key={index}>{cnvToJs(statement)}</div>

            ))}
        </Box>
    );
};
