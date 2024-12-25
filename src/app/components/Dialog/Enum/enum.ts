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
  VariableOnly = 'VariableOnly',
  VariableOrNumber = 'VariableOrNumber',
}

