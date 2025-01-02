
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
export enum UserDefinedFuncDncl {
  UserDefined = 'UserDefined',
}
export enum ReturnFuncJpDncl {
  UserDefined = '関数',
  Square = '二乗',
  Exponentiation = 'べき乗',
  Random = '乱数',
  Odd = '奇数',
}
export enum VoidFuncJpDncl {
  Binary = '二進',
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
}
export enum StatementJpEnum {
  Output = '表示文',
  Input = '代入文',
  Condition = '条件分岐文',
  ConditionalLoopPreTest = '条件繰返し文「前判定」',
  ConditionalLoopPostTest = '条件繰返し文「後判定」',
  SequentialIteration = '順次繰返し文',
  UserDefinedfunction = '新しい関数の定義',
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