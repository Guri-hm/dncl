import { ProcessEnum } from "../enum";
import { Challenge } from "../types";
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

export const allChallengesItems: Challenge[] = [
    practiceAssignment,
    practiceOutput
];

export const getChallengeById = (id: string) => {
    return allChallengesItems.find(item => item.id === id);
};

