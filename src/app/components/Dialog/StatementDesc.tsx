
import { Statement } from "../../types";

type Props = {
    statementType: Statement
}

export function StatementDesc(params: Props) {

    let str: string = "";
    switch (params.statementType) {
        case Statement.Input:
            str = "変数に値を設定します。左辺に変数または添字付きの配列を，右辺に代入する値を書きます。";
            break;
        case Statement.Condition:
            break;
    }


    return (
        <>
            {str}
        </>

    );
}
