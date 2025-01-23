

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
  UserDefinedfunction = 'UserDefinedfunction',
  FunctionName = 'FunctionName',
}

export enum inputTypeEnum {
  SwitchVariableOrNumberOrArray = 'SwitchVariableOrNumberOrArray',
  SwitchVariableOrArray = 'SwitchVariableOrArray',
  All = 'All',
  RadioWithVoid = 'RadioWithVoid',
  ArrayWithoutSuffix = 'ArrayWithoutSuffix',
  Array = 'Array',
  InitializeArray = 'InitializeArray',
  VariableOnly = 'VariableOnly',
  VariableOrNumber = 'VariableOrNumber',
  String = 'String',
  Boolean = 'Boolean',
  ReturnFunction = 'ReturnFunction',
  UserDefinedfunction = 'UserDefinedfunction',
  ExecuteUserDefinedFunction = 'ExecuteUserDefinedFunction',
  Void = 'Void',
}

//\dがうまく解釈されないため、エスケープシーケンスを更にエスケープする必要がある
export enum ValidationEnum {
  Variable = '^[a-zA-Z_$][a-zA-Z0-9_$]*$', //変数名のルール
  Integer = '^-?[\\d]+$', //整数
  VariableOrNumber = '^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)$',//変数名および数値
  InitializeArray = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)$',//配列内のカンマ区切りの文字列
  ///^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)){3,3})$/;
  Array = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//配列名のルール
  Parameters = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*))*)$',//引数定義のルール(カンマ区切りを許容し、数値ははじく)
  VariableOrArray = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//変数名・配列名のルール
  String = "^[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF\uFF65-\uFF9F\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]+$", //英数字と日本語（ひらがな、全角カタカナ、半角カタカナ）
  Function = "^(?![0-9])[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF\uFF65-\uFF9F\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]+$", //英数字と日本語（ひらがな、全角カタカナ、半角カタカナ、ただし先頭が数字ではじまるものは×）
  Parentheses = '^[()]*$',
  Negation = '^でない$',
}
