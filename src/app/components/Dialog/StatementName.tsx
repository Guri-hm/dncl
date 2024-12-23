
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
        case Statement.Condition:
            break;
    }


    return (
        <>
            {str}
        </>

    );
}
