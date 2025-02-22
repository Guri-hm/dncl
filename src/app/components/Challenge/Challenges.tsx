import { ProcessEnum, StatementJpEnum } from "@/app/enum";
import { Challenge } from "@/app/types";
import { v4 as uuidv4 } from 'uuid'

const practiceAssignment: Challenge = {
    id: "1",
    items: [
        {
            id: uuidv4(),
            line: "aを表示する",
            children: [],
            lineTokens: ["a"],
            processIndex: ProcessEnum.Output,
            fixed: true
        }
    ],
    title: '代入文の使い方',
    task: "コンソールに'30'と表示しましょう",
    hint: "代入文を使い，変数aに値を入れます",
    answer: ["30"],
};
const practiceOutput: Challenge = {
    id: "2",
    items: [
        {
            id: uuidv4(),
            line: "a ← \"こんにちは\"",
            children: [],
            lineTokens: ["a", "\"こんにちは\"",],
            processIndex: ProcessEnum.SetValToVariableOrArray,
            fixed: true
        }
    ],
    title: '表示文の使い方',
    task: "コンソールに'こんにちは'と表示しましょう",
    hint: "表示文で変数または文字列を表示します",
    answer: ["こんにちは"],
};
const practiceArithmeticOperation: Challenge = {
    id: "3",
    items: [
        {
            id: uuidv4(),
            line: "a ← \"2\"",
            children: [],
            lineTokens: ["a", "2",],
            processIndex: ProcessEnum.SetValToVariableOrArray,
            fixed: true
        },
        {
            id: uuidv4(),
            line: "aを表示する",
            children: [],
            lineTokens: [
                "a"
            ],
            processIndex: 0,
            fixed: true
        }
    ],
    title: '算術演算しましょう',
    task: "変数aを使い，コンソールに'10'と表示しましょう",
    hint: "変数aにa+8を代入します",
    answer: ["10"],
    requiredItems: [
        {
            id: uuidv4(),
            "line": "a ← a + 8",
            "children": [],
            "lineTokens": [
                "a",
                "a + 8"
            ],
            "processIndex": 1,
            "variables": [
                "a"
            ]
        },
    ]
};
const practiceIf: Challenge = {
    id: "4",
    items: [
        {
            id: uuidv4(),
            line: "もしa > 10ならば",
            children: [
                {
                    id: uuidv4(),
                    line: "\"こんにちは\"を表示する",
                    children: [],
                    lineTokens: [
                        "\"こんにちは\""
                    ],
                    processIndex: 0,
                    variables: []
                }
            ],
            lineTokens: [
                "a > 10"
            ],
            processIndex: 6,
            variables: []
        },
        {
            id: uuidv4(),
            line: "を実行する",
            children: [],
            lineTokens: [],
            processIndex: 9,
            variables: []
        }
    ],
    title: '条件分岐文の実行',
    task: "条件を満たしましょう",
    hint: "変数aの値を10より大きい値にします",
    answer: ["こんにちは"],
    usableItems: [
        StatementJpEnum.Input,
    ]
};

export const allChallengesItems: Challenge[] = [
    practiceAssignment,
    practiceOutput,
    practiceArithmeticOperation,
    practiceIf
];

export const getChallengeById = (id: string) => {
    return allChallengesItems.find(item => item.id === id);
};

