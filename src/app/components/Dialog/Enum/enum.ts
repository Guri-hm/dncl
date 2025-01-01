export enum processEnum {
  Output = '表示',
  SetValueToVariableOrArrayElement = '変数または配列の要素への代入',
  InitializeArray = '配列の初期化',
  BulkAssignToArray = '配列への一括代入',
  Increment = '加算を伴う代入',
  Decrement = '減算を伴う代入',
  If = 'もし〈条件〉ならば',
  ElseIf = 'を実行し，そうでなくもし〈条件〉ならば',
  Else = 'を実行し，そうでなければ',
  EndIf = 'を実行する',
  While = '〈条件〉の間',
  EndWhile = 'を繰り返す',
  DoWhile = '繰り返し，',
  EndDoWhile = 'を，〈条件〉になるまで実行する',
  ForIncrement = '〈変数〉の値を増やしながら，',
  ForDecrement = '〈変数〉の値を減らしながら，',
  EndFor = 'を繰り返す',
  Predefinedfunction = '用意された関数',
}

export enum bracketEnum {
  LeftBraket = 'LeftBraket',
  RigthBraket = 'RigthBraket',
}

export enum LogicalOperationEnum {
  And = 'And',
  Or = 'Or',
  Not = 'Not',
}

export enum keyPrefixEnum {
  LeftSide = 'LeftSide',
  RigthSide = 'RigthSide',
  Suffix = 'Suffix',
  Argument = 'Argument',
  Operator = 'Operator',
  LeftOfOperand = 'LeftOfOperand',
  RightOfOperand = 'RightOfOperand',
  Negation = 'Negation',
  Type = 'Type',
  InitialValue = 'InitialValue',
  EndValue = 'EndValue',
  Difference = 'Difference',
  Function = 'Function',
  FunctionName = 'FunctionName',
}

export enum inputTypeEnum {
  SwitchVariableOrNumberOrArray = 'SwitchVariableOrNumberOrArray',
  SwitchVariableOrArray = 'SwitchVariableOrArray',
  RadioWithString = 'RadioWithString',
  RadioWithReturnFunction = 'RadioWithReturnFunction',
  RadioWithVoid = 'RadioWithVoid',
  ArrayWithoutSuffix = 'ArrayWithoutSuffix',
  Array = 'Array',
  SuffixOnly = 'SuffixOnly',
  SuffixWithBrackets = 'SuffixWithBrackets',
  InitializeArray = 'InitializeArray',
  VariableOnly = 'VariableOnly',
  VariableOrNumber = 'VariableOrNumber',
  Number = 'Number',
  String = 'String',
  ReturnFunction = 'ReturnFunction',
  Void = 'Void',
}

//\dがうまく解釈されないため、エスケープシーケンスを更にエスケープする必要がある
export enum ValidationEnum {
  Variable = '^[a-zA-Z_$][a-zA-Z0-9_$]*$', //変数名のルール
  Integer = '^-?[\\d]+$', //整数
  VariableOrNumber = '^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)$',//変数名および数値
  InitializeArray = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)$',//配列内のカンマ区切りの文字列
  Array = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//配列名のルール
  VariableOrArray = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//変数名・配列名のルール
  String = "^[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF\uFF65-\uFF9F\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]+$", //英数字と日本語（ひらがな、全角カタカナ、半角カタカナ）
  Parentheses = '^[()]*$',
  Negation = '^でない$',
}
