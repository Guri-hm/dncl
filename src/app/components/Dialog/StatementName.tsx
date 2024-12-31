
import { StatementEnum, StatementJpEnum } from "@/app/enum";

type Props = {
    statementType: StatementEnum
}

export function StatementName(params: Props) {

    let str: string = "";
    switch (params.statementType) {
        case StatementEnum.Output:
            str = StatementJpEnum.Output;
            break;
        case StatementEnum.Input:
            str = StatementJpEnum.Input;
            break;
        case StatementEnum.Condition:
            str = StatementJpEnum.Condition;
            break;
        case StatementEnum.ConditionalLoopPreTest:
            str = StatementJpEnum.ConditionalLoopPreTest;
            break;
        case StatementEnum.ConditionalLoopPostTest:
            str = StatementJpEnum.ConditionalLoopPostTest;
            break;
        case StatementEnum.SequentialIteration:
            str = StatementJpEnum.SequentialIteration;
            break;
    }


    return (
        <>
            {str}
        </>

    );
}
