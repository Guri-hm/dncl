
import { Statement } from "../../types";
import React from 'react';
import { Typography } from "@mui/material";
type Props = {
    statementType: Statement
}

export function StatementDesc(params: Props) {

    let str: string = "";
    let sub: string = "";
    switch (params.statementType) {
        case Statement.Input:
            str = "変数や配列に値を設定します。左辺に変数または添字付きの配列を，右辺に代入する値を書きます。";
            sub = "・変数名・配列名には，半角英数字，アンダースコア(_），ドル記号($)が使用できます。\n\
            ・1文字目には数字が使用できません。\n\
            ・Javascriptの予約語も使用できません。 \n\
            ・DNCLでは原則，変数名は小文字で始まり、配列は大文字で始まります。";
            break;
        case Statement.Operation:
            str = "算術演算と比較演算，そして論理演算をおこないます。";
            sub = "";
            break;
        case Statement.Condition:
            break;
    }


    return (
        <>
            {str}
            <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                {sub.split('\n').map((line, index) => (<React.Fragment key={index}> {line} <br /> </React.Fragment>))}
            </Typography>
        </>

    );
}
