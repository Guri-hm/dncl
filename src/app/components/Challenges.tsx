import { ProcessEnum } from "../enum";
import { Challenge } from "../types";
import { v4 as uuidv4 } from 'uuid'

const practiceAssignment: Challenge = {
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
    title: '代入文',
    task: "コンソールに'30'と表示しましょう",
    hint: "代入文を使い，変数aに値を入れます",
    answer: ["30"],
};
const practiceOutput: Challenge = {
    items: [
        {
            id: uuidv4(),
            line: "a ← 1",
            children: [],
            lineTokens: ["a"],
            processIndex: ProcessEnum.Output,
            fixed: true
        }
    ],
    title: '表示文',
    task: "コンソールに'30'と表示しましょう",
    hint: "代入文を使い，変数aに値を入れます",
    answer: ["30"],
};

export const allChallengesItems: { [key: string]: Challenge | null } = {
    "1": practiceAssignment,
    "2": practiceOutput
};