export enum processEnum {
  SetValueToVariable = '変数への代入',
  InitializeArray = '配列の初期化',
  AssignValueToIndex = '配列の要素への代入',
  BulkAssignToArray = '配列への一括代入',
  Increment = '加算を伴う代入',
  Decrement = '減算を伴う代入',
}

export enum keyPrefixEnum {
  LeftSide = 'LeftSide',
  RigthSide = 'RigthSide',
  Suffix = 'Suffix'
}

export enum inputTypeEnum {
  Switch = 'Switch',
  ArrayWithoutSuffix = 'ArrayWithoutSuffix',
  Array = 'Array',
  SuffixOnly = 'SuffixOnly',
  SuffixWithBrackets = 'SuffixWithBrackets',
  InitializeArray = 'InitializeArray',
  VariableOnly = 'VariableOnly',
  VariableOrNumber = 'VariableOrNumber',
}

export enum ValidationEnum {
  Variable = '^[a-zA-Z_$][a-zA-Z0-9_$]*$', //変数名のルール
  VariableOrNumber = '^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)$',//変数名および数値
  InitializeArray = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)$',//配列内のカンマ区切りの文字列
  Array = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//配列名のルール
}
