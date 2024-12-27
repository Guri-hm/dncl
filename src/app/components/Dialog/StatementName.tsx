
import { Statement } from "../../types";

type Props = {
    statementType: Statement
}

export function StatementName(params: Props) {

    let str: string = "";
    switch (params.statementType) {
        case Statement.Input:
            str = "代入文";
            break;
        case Statement.Operation:
            str = "演算";
            break;
        case Statement.Condition:
            str = "条件文";
            break;
    }


    return (
        <>
            {str}
        </>

    );
}
