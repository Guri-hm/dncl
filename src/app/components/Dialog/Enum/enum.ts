export enum processEnum {
  SetValueToVariable = '変数への代入',
  InitializeArray = '配列の初期化',
  AssignValueToIndex = '配列への代入(添字)',
  BulkAssignToArray = '配列への一括代入',
  Increment = '加算を伴う代入',
  Decrement = '減算を伴う代入',
}

export enum keyPrefixEnum {
  LeftSide = 'LeftSide',
  RigthSide = 'RigthSide',
  Suffix = 'Suffix'
}