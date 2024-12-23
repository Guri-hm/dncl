
import { Statement } from "../../types";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type Props = {
    statementType: Statement
}

export function StatementEditor(params: Props) {

    let elm: ReactElement = <></>;

    switch (params.statementType) {
        case Statement.Input:
            const result = processNames.filter(item => item.statementType == Statement.Input)
                .flatMap(item => item.names);
            const defaultProps = {
                options: result,
                getOptionLabel: (option: processTypes) => option.title,
            };

            elm =
                <>
                    <Autocomplete
                        {...defaultProps}
                        id="auto-select"
                        autoSelect
                        renderInput={(params) => (
                            <TextField {...params} label="処理の内容" variant="standard" />
                        )}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            p: 1,
                            m: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                        }}
                    >
                        <TextField
                            slotProps={{
                                htmlInput: {
                                    className: 'text-center'
                                }
                                ,

                            }}
                            required
                            id="outlined-required"
                            label="左辺"
                            defaultValue=""
                        />
                        <Box sx={{
                            display: 'grid',
                            alignItems: 'center'
                        }}>
                            <ArrowBackIcon></ArrowBackIcon>
                        </Box>
                        <TextField
                            id="outlined-required"
                            label="右辺"
                            defaultValue=""
                            slotProps={{
                                htmlInput: {
                                    className: 'text-center'
                                }
                                ,

                            }}
                        />
                    </Box>
                </>;
            break;
        case Statement.Condition:
            break;
        default:
            break;
    }

    return (
        <>
            {elm}
        </>

    );
}


interface processTypes {
    title: processEnum;
    type: processEnum;
}

export enum processEnum {
    SetValueToVariable = '変数への代入',
    InitializeArray = '配列の初期化',
    AssignValueToIndex = '配列への代入(添字)',
    BulkAssignToArray = '配列への一括代入',

}

const processNames = [
    {
        statementType: Statement.Input,
        names: [
            { title: processEnum.SetValueToVariable, type: processEnum.SetValueToVariable },
            { title: processEnum.InitializeArray, type: processEnum.InitializeArray },
            { title: processEnum.AssignValueToIndex, type: processEnum.AssignValueToIndex },
            { title: processEnum.BulkAssignToArray, type: processEnum.BulkAssignToArray },
        ]
    }
];

