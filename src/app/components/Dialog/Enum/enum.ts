

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
  SwitchVariableOrArrayWithConstant = 'SwitchVariableOrArrayWithConstant',
  All = 'All',
  RadioWithVoid = 'RadioWithVoid',
  ArrayWithoutSuffix = 'ArrayWithoutSuffix',
  Array = 'Array',
  InitializeArray = 'InitializeArray',
  VariableOnly = 'VariableOnly',
  Number = 'Number',
  Variable = 'Variable',
  ForValue = 'ForValue', // For文の初期値・終了値・差分用
  String = 'String',
  Boolean = 'Boolean',
  ReturnFunction = 'ReturnFunction',
  UserDefinedfunction = 'UserDefinedfunction',
  ExecuteUserDefinedFunction = 'ExecuteUserDefinedFunction',
  Void = 'Void',
}

//\dがうまく解釈されないため、エスケープシーケンスを更にエスケープする必要がある
export enum ValidationEnum {
  Variable = '^[a-zA-Z][a-zA-Z0-9_]*$',//変数名・配列名（先頭は英字のみ、その後は英数字と_）
  Number = '^-?\\d+(\\.\\d+)?$', // 負号は先頭のみ、数値部分は連続した数字のみ
  Constant = '^[A-Z][A-Z0-9_]*$', // 定数用（先頭は英字、大文字のみ）
  Integer = '^-?[\\d]+$', //整数
  VariableOrPositiveInteger = '^(?:[a-zA-Z][a-zA-Z0-9_]*|\\d+)$',//変数名および正の整数(添字用、負数は禁止)
  VariableOrInteger = '^(?:[a-zA-Z][a-zA-Z0-9_]*|-?\\d+)$',//変数および整数(負の数可能)
  InitializeArray = '^(?:(?:[a-zA-Z][a-zA-Z0-9_]*|-?\\d+(?:\\.\\d+)?)(?:,(?:[a-zA-Z][a-zA-Z0-9_]*|-?\\d+(?:\\.\\d+)?))*)$',//配列内のカンマ区切り（小数点対応）
  ///^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)){3,3})$/;
  Parameters = '^(?:(?:[a-zA-Z][a-zA-Z0-9_]*|-?\\d+(?:\\.\\d+)?)(?:,(?:[a-zA-Z][a-zA-Z0-9_]*|-?\\d+(?:\\.\\d+)?))*)?$',//引数定義のルール(変数名・数値のカンマ区切り、負数・小数も許可)
  String = '^[^<>&`"\'{}$\\\\\\/\\[\\]|;]+$', // 危険となる記号類を除外してその他は許可
  Function = "^(?![0-9])[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF\uFF65-\uFF9F\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]+$", //英数字と日本語（ひらがな、全角カタカナ、半角カタカナ、ただし先頭が数字ではじまるものは×）
  Parentheses = '^[()]*$',
  Negation = '^でない$',
}
