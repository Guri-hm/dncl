import { ProcessEnum, StatementJpEnum } from "@/app/enum";
import { Challenge } from "@/app/types";
import { v4 as uuidv4 } from 'uuid'

const practiceAssignment: Challenge = {
    id: "basic-1",
    difficulty: "basic",
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
    usableItems: [
        StatementJpEnum.Input,
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 1
    },
};
const practiceOutput: Challenge = {
    id: "basic-2",
    difficulty: "basic",
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
    usableItems: [
        StatementJpEnum.Output,
    ],
    usableItemLimits: {
        [StatementJpEnum.Output]: 1
    },
};
const practiceArithmeticOperation: Challenge = {
    id: "basic-3",
    difficulty: "basic",
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
    task: "算術演算の結果を変数aに代入し，コンソールに'10'と表示しましょう",
    hint: "変数aにa+8を代入します",
    answer: ["10"],
    usableItems: [
        StatementJpEnum.Input,
    ],
    requiredItems: [
        {
            id: uuidv4(),
            lhs: "a",
            rhs: "a + 8",
            processIndex: ProcessEnum.SetValToVariableOrArray,
            variables: ["a"],
        },
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 1
    },
};
const practiceIf: Challenge = {
    id: "basic-4",
    difficulty: "basic",
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
                    variables: [],
                    fixed: true
                }
            ],
            lineTokens: [
                "a > 10"
            ],
            processIndex: 6,
            variables: [],
            fixed: true
        },
        {
            id: uuidv4(),
            line: "を実行する",
            children: [],
            lineTokens: [],
            processIndex: 9,
            variables: [],
            fixed: true
        }
    ],
    title: '条件分岐文の実行',
    task: "「こんにちは」を出力しましょう",
    hint: "変数aの値を10より大きい値にします",
    answer: ["こんにちは"],
    usableItems: [
        StatementJpEnum.Input,
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 1
    },
};

const practiceArray: Challenge = {
    id: "basic-5",
    difficulty: "basic",
    items: [
        {
            id: uuidv4(),
            line: "Ten ← [64 , 70 , 47]",
            children: [],
            lineTokens: [
                "Ten",
                "64 , 70 , 47"
            ],
            processIndex: 2,
            variables: ["Ten"],
            fixed: true
        },
    ],
    title: '配列の使い方',
    task: "配列Tenの3つの要素を合計して，変数goukeiに代入し，goukeiをコンソールに出力しましょう。",
    hint: "配列の要素は添字で指定します。今回は添字は0，1，2の3つで，Ten[1]のように使います。",
    answer: ["181"],
    usableItems: [
        StatementJpEnum.Input,
        StatementJpEnum.Output,
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 1,
        [StatementJpEnum.Output]: 1
    },
};

const practiceArrayLoop: Challenge = {
    id: "basic-6",
    difficulty: "basic",
    items: [
        {
            id: uuidv4(),
            line: "Ten ← [64 , 70 , 47]",
            children: [],
            lineTokens: ["Ten", "64 , 70 , 47"],
            variables: ["Ten"],
            processIndex: ProcessEnum.InitializeArray,
            fixed: true
        },
    ],
    title: '繰り返し文の実行',
    task: "配列 Ten のすべての要素を繰り返しを使って順にコンソールへ出力してください。",
    hint: "繰り返し（ループ）を使って Ten[i] を順に出力します。",
    answer: ["64,70,47"],
    usableItems: [
        StatementJpEnum.Input,
        StatementJpEnum.Output,
        StatementJpEnum.ConditionalLoopPreTest
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 2,
        [StatementJpEnum.Output]: 1,
        [StatementJpEnum.ConditionalLoopPreTest]: 2
    },
};

export const basicChallenges: Challenge[] = [
    practiceAssignment,
    practiceOutput,
    practiceArithmeticOperation,
    practiceIf,
    practiceArray,
    practiceArrayLoop
];

const advancedLoop: Challenge = {
    id: "adv-1",
    difficulty: "advanced",
    items: [
        {
            id: uuidv4(),
            line: "sumを表示する",
            children: [],
            lineTokens: ["sum"],
            processIndex: ProcessEnum.Output,
            fixed: true
        },
    ],
    title: '繰り返し文による合計計算',
    task: "1から10までの合計を計算し、変数sumに代入してコンソールに出力しましょう。",
    hint: "繰り返し（ループ）を使います。",
    answer: ["55"],
    usableItems: [
        StatementJpEnum.Input,
        StatementJpEnum.ConditionalLoopPreTest,
        StatementJpEnum.ConditionalLoopPostTest,
        StatementJpEnum.SequentialIteration,
    ],
    usableItemLimits: {
        [StatementJpEnum.Input]: 2,
    },
};

export const advancedChallenges: Challenge[] = [
    advancedLoop,
];

export const combinedChallenges: Challenge[] = (() => {
    const map = new Map<string, Challenge>();
    for (const c of [...basicChallenges, ...advancedChallenges]) {
        if (!map.has(c.id)) map.set(c.id, c);
    }
    return Array.from(map.values());
})();

export const getChallengeById = (id: string) => {
    return combinedChallenges.find(item => item.id === id);
};

