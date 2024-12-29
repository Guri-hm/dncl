
import { StatementEnum } from "@/app/enum";

type Props = {
    statementType: StatementEnum
}

export function StatementName(params: Props) {

    let str: string = "";
    switch (params.statementType) {
        case StatementEnum.Output:
            str = "表示文";
            break;
        case StatementEnum.Input:
            str = "代入文";
            break;
        case StatementEnum.Condition:
            str = "条件文";
            break;
    }


    return (
        <>
            {str}
        </>

    );
}
