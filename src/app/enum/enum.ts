
export enum OperatorEnum {
  SimpleAssignment = '←',
}

export enum ArithmeticOperatorJs {
  AdditionOperator = '+',
  SubtractionOperator = '-',
  MultiplicationOperator = '*',
  DivisionOperator = '/',
  DivisionOperatorQuotient = '÷',
  DivisionOperatorRemaining = '%',
}
export enum ComparisonOperatorJs {
  EqualToOperator = '==',
  NotEqualToOperator = '!=',
  GreaterThanOperator = '>',
  GreaterThanOrEqualToOperator = '>=',
  LessThanOperator = '<',
  LessThanOrEqualToOperator = '<=',
}

export enum AndOrOperatorJpArrayForDncl {
  AndOperator = 'かつ',
  OrOperator = 'または',
}
export enum ReturnFuncDncl {
  Square = 'Square',
  Exponentiation = 'Exponentiation',
  Random = 'Random',
  Odd = 'Odd',
}
export enum VoidFuncDncl {
  Binary = 'Binary',
}
export enum BooleanDncl {
  True = 'true',
  False = 'false',
}
export enum UserDefinedFuncDncl {
  UserDefined = 'UserDefined',
  Define = 'Define',
}
export enum UserDefinedFuncJpDncl {
  UserDefined = '関数',
}
export enum UserDefinedFuncJs {
  UserDefined = 'function',
}
export enum ReturnFuncJpDncl {
  Square = '二乗',
  Exponentiation = 'べき乗',
  Random = '乱数',
  Odd = '奇数',
}
export enum VoidFuncJpDncl {
  Binary = '二進',
}
export enum BooleanJpDncl {
  True = '真',
  False = '偽',
}
export enum NegationOperatorJpArray {
  NullOperator = '',
  NegationOperator = 'でない',
}

export enum ComparisonOperatorDncl {
  EqualToOperator = '=',
  NotEqualToOperator = '≠',
  GreaterThanOperator = '≻',
  GreaterThanOrEqualToOperator = '≧',
  LessThanOperator = '≺',
  LessThanOrEqualToOperator = '≦',
  NullOperator = '',
}
export enum ArithmeticOperatorDncl {
  MultiplicationOperator = '×',
}

export enum StatementEnum {
  Output = 'Output',
  Input = 'Input',
  Condition = 'Condition',
  ConditionalLoopPreTest = 'ConditionalLoopPreTest',
  ConditionalLoopPostTest = 'ConditionalLoopPostTest',
  SequentialIteration = 'SequentialIteration',
  Predefinedfunction = 'Predefinedfunction',
  UserDefinedfunction = 'UserDefinedfunction',
  ExecuteUserDefinedFunction = 'ExecuteUserDefinedFunction',
}
export enum StatementJpEnum {
  Output = '表示文',
  Input = '代入文',
  Condition = '条件分岐文',
  ConditionalLoopPreTest = '条件繰返し文「前判定」',
  ConditionalLoopPostTest = '条件繰返し文「後判定」',
  SequentialIteration = '順次繰返し文',
  UserDefinedfunction = '新しい関数の定義',
  ExecuteUserDefinedFunction = '定義した関数の実行',
}

export enum OperationEnum {
  JoinString = 'JoinString',
  SimpleAssignment = 'SimpleAssignment',
  Negation = ' Negation',
  Arithmetic = 'Arithmetic',
  Comparison = 'Comparison',
  Logical = 'Logical',
}
export enum OperatorTypeJpEnum {
  Arithmetic = '算術',
  Comparison = '比較',
  Logical = '論理',
}

export enum BraketSymbolEnum {
  LeftBraket = '(',
  RigthBraket = ')',
  OpenBrace = '{',
  CloseBrace = '}',
}

export enum LogicalOperationJpEnum {
  And = 'かつ',
  Or = 'または',
  Not = 'でない',
}

export enum InputTypeJpEnum {
  Switch = '変数名・配列名',
  ArrayWithoutSuffix = '配列名',
  Array = '配列名',
  SuffixOnly = '添字',
  SuffixWithBrackets = '添字',
  VariableOnly = '変数名',
  VariableOrNumber = '値・変数名',
  String = '文字列',
  Function = '関数名',
  Argument = '引数',
}

export enum ProcessEnum {
  Output = '表示',
  SetValToVariableOrArray = '変数または配列の要素への代入',
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
  DefineFunction = '関数〈関数名〉(〈引数列〉)を',
  Defined = 'と定義する',
  ExecuteUserDefinedFunction = '関数を実行する',
  Unknown = '不明',
  // EndPhase = '区切り',
}