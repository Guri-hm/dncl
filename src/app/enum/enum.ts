
export enum OperatorEnum {
  SimpleAssignment = '←',
  AdditionOperator = '+',
  SubtractionOperator = '-',
  DivisionOperator = '/',
  DivisionOperatorQuotient = '÷',
  DivisionOperatorRemaining = '%',
  MultiplicationOperator = '×',
}

export enum ArithmeticOperatorSymbolArray {
  AdditionOperator = '+',
  SubtractionOperator = '-',
  MultiplicationOperator = '×',
  DivisionOperator = '/',
  DivisionOperatorQuotient = '÷',
  DivisionOperatorRemaining = '%',
  NullOperator = '',
}
export enum ComparisonOperatorSymbolArrayForJavascript {
  EqualToOperator = '==',
  NotEqualToOperator = '!=',
  GreaterThanOperator = '>',
  GreaterThanOrEqualToOperator = '>=',
  LessThanOperator = '<',
  LessThanOrEqualToOperator = '<=',
  NotUsed = '',
  // And = '&&',
  // Or = '||',
  // Not = '!',
}
export enum ComparisonOperatorSymbolArrayForDncl {
  EqualToOperator = '=',
  NotEqualToOperator = '≠',
  GreaterThanOperator = '≻',
  GreaterThanOrEqualToOperator = '≧',
  LessThanOperator = '≺',
  LessThanOrEqualToOperator = '≦',
  NullOperator = '',
}

export enum StatementEnum {
  Output = 'output',
  Input = 'input',
  Condition = 'condition',
}
export enum StatementJpEnum {
  Output = '表示文',
  Input = '代入文',
  Condition = '条件分岐文',
}

export enum OperationEnum {
  Condition = 'condition',
  Operation = 'operation',
  JoinString = 'joinString',
  SimpleAssignment = 'simpleAssignment'
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
