
import { StatementEnum } from '@/app/enum';
import React from 'react';
import { Typography } from "@mui/material";
type Props = {
    statementType: StatementEnum
}

export function StatementDesc(params: Props) {

    let str: string = "";
    let sub: string = "";
    switch (params.statementType) {
        case StatementEnum.Input:
            str = "変数や配列に値を設定します。左辺に変数または添字付きの配列を，右辺に代入する値を書きます。";
            sub = "・変数名・配列名には，半角英数字，アンダースコア(_），ドル記号($)が使用できます。\n\
            ・1文字目には数字が使用できません。\n\
            ・Javascriptの予約語も使用できません。 \n\
            ・DNCLでは原則，変数名は小文字で始まり、配列は大文字で始まります。";
            break;
        case StatementEnum.Output:
            str = "数値や文字列や変数の値を表示します。";
            sub = "・複数の値を表示する場合は『と』で区切って並べます。\n\
            ・例えば、kosu と「個見つかった」，のように並べた場合、kosu が3のとき，「3個見つかった」と表示されます。\n\
            ";
            break;
        case StatementEnum.Condition:
            str = "〈条件〉が成り立つかどうかによって，実行する処理を切り替えます。";
            sub = "・〈条件〉には比較演算か論理演算を使用します。\n\
            ・〈条件〉の子要素〈処理〉は表示文や代入文で作成します。\n\
            ";
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
