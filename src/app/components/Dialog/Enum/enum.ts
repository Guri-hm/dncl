export enum processEnum {
  SetValueToVariableOrArrayElement = '変数または配列の要素への代入',
  InitializeArray = '配列の初期化',
  BulkAssignToArray = '配列への一括代入',
  Increment = '加算を伴う代入',
  Decrement = '減算を伴う代入',
  ArithmeticOperation = '算術演算',
  ComparisonOperation = '比較演算',
}

export enum bracketEnum {
  LeftBraket = 'LeftBraket',
  RigthBraket = 'RigthBraket',
}

export enum keyPrefixEnum {
  LeftSide = 'LeftSide',
  RigthSide = 'RigthSide',
  Suffix = 'Suffix',
  Operator = 'Operator',
  LeftOfTerm = 'LeftOfTerm',
  RightOfTerm = 'RightOfTerm',
}

export enum inputTypeEnum {
  SwitchVariableOrArrayWithSuffix = 'SwitchVariableOrArrayWithSuffix',
  ArrayWithoutSuffix = 'ArrayWithoutSuffix',
  Array = 'Array',
  SuffixOnly = 'SuffixOnly',
  SuffixWithBrackets = 'SuffixWithBrackets',
  InitializeArray = 'InitializeArray',
  VariableOnly = 'VariableOnly',
  SwitchVariableOrArrayWithoutSuffix = 'SwitchVariableOrArrayWithoutSuffix',
  VariableOrNumber = 'VariableOrNumber',
}

export enum ValidationEnum {
  Variable = '^[a-zA-Z_$][a-zA-Z0-9_$]*$', //変数名のルール
  VariableOrNumber = '^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)$',//変数名および数値
  InitializeArray = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)$',//配列内のカンマ区切りの文字列
  Array = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//配列名のルール
  VariableOrArray = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//変数名・配列名のルール
}
