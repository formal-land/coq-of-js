// @flow
/* eslint-disable no-use-before-define */
// Extracted from the Flow generated file of the package `@babel/types`.
// Changes:
// * remove the `BabelNode` prefix from type names;
// * use types instead of classes (however the `?:` syntax is not supported);
// * remove the `Noop` case from type annotations;
// * remove the `TS...` types.

export type Comment = {
  value: string,
  start: number,
  end: number,
  loc: SourceLocation,
};

export type CommentBlock = Comment & {
  type: "CommentBlock",
};

export type CommentLine = Comment & {
  type: "CommentLine",
};

export type SourceLocation = {
  start: {
    line: number,
    column: number,
  },

  end: {
    line: number,
    column: number,
  },
};

export type Node = {
  leadingComments?: Array<Comment>,
  innerComments?: Array<Comment>,
  trailingComments?: Array<Comment>,
  start: ?number,
  end: ?number,
  loc: ?SourceLocation,
};

export type ArrayExpression = Node & {
  type: "ArrayExpression",
  elements?: Array<null | Expression | SpreadElement>,
};

export type AssignmentExpression = Node & {
  type: "AssignmentExpression",
  operator: string,
  left: LVal,
  right: Expression,
};

export type BinaryExpression = Node & {
  type: "BinaryExpression",
  operator:
    | "+"
    | "-"
    | "/"
    | "%"
    | "*"
    | "**"
    | "&"
    | "|"
    | ">>"
    | ">>>"
    | "<<"
    | "^"
    | "=="
    | "==="
    | "!="
    | "!=="
    | "in"
    | "instanceof"
    | ">"
    | "<"
    | ">="
    | "<=",
  left: Expression,
  right: Expression,
};

export type InterpreterDirective = Node & {
  type: "InterpreterDirective",
  value: string,
};

export type Directive = Node & {
  type: "Directive",
  value: DirectiveLiteral,
};

export type DirectiveLiteral = Node & {
  type: "DirectiveLiteral",
  value: string,
};

export type BlockStatement = Node & {
  type: "BlockStatement",
  body: Array<Statement>,
  directives?: Array<Directive>,
};

export type BreakStatement = Node & {
  type: "BreakStatement",
  label?: Identifier,
};

export type CallExpression = Node & {
  type: "CallExpression",
  callee: Expression,
  arguments: Array<
    Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder,
  >,
  optional?: true | false,
  typeArguments?: TypeParameterInstantiation,
};

export type CatchClause = Node & {
  type: "CatchClause",
  param?: Identifier,
  body: BlockStatement,
};

export type ConditionalExpression = Node & {
  type: "ConditionalExpression",
  test: Expression,
  consequent: Expression,
  alternate: Expression,
};

export type ContinueStatement = Node & {
  type: "ContinueStatement",
  label?: Identifier,
};

export type DebuggerStatement = Node & {
  type: "DebuggerStatement",
};

export type DoWhileStatement = Node & {
  type: "DoWhileStatement",
  test: Expression,
  body: Statement,
};

export type EmptyStatement = Node & {
  type: "EmptyStatement",
};

export type ExpressionStatement = Node & {
  type: "ExpressionStatement",
  expression: Expression,
};

export type File = Node & {
  type: "File",
  program: Program,
  comments: any,
  tokens: any,
};

export type ForInStatement = Node & {
  type: "ForInStatement",
  left: VariableDeclaration | LVal,
  right: Expression,
  body: Statement,
};

export type ForStatement = Node & {
  type: "ForStatement",
  init?: VariableDeclaration | Expression,
  test?: Expression,
  update?: Expression,
  body: Statement,
};

export type FunctionDeclaration = Node & {
  type: "FunctionDeclaration",
  id?: Identifier,
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement,
  generator?: boolean,
  async?: boolean,
  declare?: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type FunctionExpression = Node & {
  type: "FunctionExpression",
  id?: Identifier,
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement,
  generator?: boolean,
  async?: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type Identifier = Node & {
  type: "Identifier",
  name: string,
  decorators?: Array<Decorator>,
  optional?: boolean,
  typeAnnotation?: TypeAnnotation,
};

export type IfStatement = Node & {
  type: "IfStatement",
  test: Expression,
  consequent: Statement,
  alternate?: Statement,
};

export type LabeledStatement = Node & {
  type: "LabeledStatement",
  label: Identifier,
  body: Statement,
};

export type StringLiteral = Node & {
  type: "StringLiteral",
  value: string,
};

export type NumericLiteral = Node & {
  type: "NumericLiteral",
  value: number,
};

export type NullLiteral = Node & {
  type: "NullLiteral",
};

export type BooleanLiteral = Node & {
  type: "BooleanLiteral",
  value: boolean,
};

export type RegExpLiteral = Node & {
  type: "RegExpLiteral",
  pattern: string,
  flags?: string,
};

export type LogicalExpression = Node & {
  type: "LogicalExpression",
  operator: "||" | "&&" | "??",
  left: Expression,
  right: Expression,
};

export type MemberExpression = Node & {
  type: "MemberExpression",
  object: Expression,
  property: any,
  computed?: boolean,
  optional?: true | false,
};

export type NewExpression = Node & {
  type: "NewExpression",
  callee: Expression,
  arguments: Array<
    Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder,
  >,
  optional?: true | false,
  typeArguments?: TypeParameterInstantiation,
};

export type Program = Node & {
  type: "Program",
  body: Array<Statement>,
  directives?: Array<Directive>,
  sourceType?: "script" | "module",
  interpreter?: InterpreterDirective,
  sourceFile?: string,
};

export type ObjectExpression = Node & {
  type: "ObjectExpression",
  properties: Array<ObjectMethod | ObjectProperty | SpreadElement>,
};

export type ObjectMethod = Node & {
  type: "ObjectMethod",
  kind?: "method" | "get" | "set",
  key: any,
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement,
  computed?: boolean,
  async?: boolean,
  decorators?: Array<Decorator>,
  generator?: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type ObjectProperty = Node & {
  type: "ObjectProperty",
  key: any,
  value: Expression | PatternLike,
  computed?: boolean,
  shorthand?: boolean,
  decorators?: Array<Decorator>,
};

export type RestElement = Node & {
  type: "RestElement",
  argument: LVal,
  decorators?: Array<Decorator>,
  typeAnnotation?: TypeAnnotation,
};

export type ReturnStatement = Node & {
  type: "ReturnStatement",
  argument?: Expression,
};

export type SequenceExpression = Node & {
  type: "SequenceExpression",
  expressions: Array<Expression>,
};

export type ParenthesizedExpression = Node & {
  type: "ParenthesizedExpression",
  expression: Expression,
};

export type SwitchCase = Node & {
  type: "SwitchCase",
  test?: Expression,
  consequent: Array<Statement>,
};

export type SwitchStatement = Node & {
  type: "SwitchStatement",
  discriminant: Expression,
  cases: Array<SwitchCase>,
};

export type ThisExpression = Node & {
  type: "ThisExpression",
};

export type ThrowStatement = Node & {
  type: "ThrowStatement",
  argument: Expression,
};

export type TryStatement = Node & {
  type: "TryStatement",
  block: BlockStatement,
  handler?: CatchClause,
  finalizer?: BlockStatement,
};

export type UnaryExpression = Node & {
  type: "UnaryExpression",
  operator: "void" | "throw" | "delete" | "!" | "+" | "-" | "~" | "typeof",
  argument: Expression,
  prefix?: boolean,
};

export type UpdateExpression = Node & {
  type: "UpdateExpression",
  operator: "++" | "--",
  argument: Expression,
  prefix?: boolean,
};

export type VariableDeclaration = Node & {
  type: "VariableDeclaration",
  kind: "var" | "let" | "const",
  declarations: Array<VariableDeclarator>,
  declare?: boolean,
};

export type VariableDeclarator = Node & {
  type: "VariableDeclarator",
  id: LVal,
  init?: Expression,
  definite?: boolean,
};

export type WhileStatement = Node & {
  type: "WhileStatement",
  test: Expression,
  body: BlockStatement | Statement,
};

export type WithStatement = Node & {
  type: "WithStatement",
  object: Expression,
  body: BlockStatement | Statement,
};

export type AssignmentPattern = Node & {
  type: "AssignmentPattern",
  left: Identifier | ObjectPattern | ArrayPattern | MemberExpression,
  right: Expression,
  decorators?: Array<Decorator>,
  typeAnnotation?: TypeAnnotation,
};

export type ArrayPattern = Node & {
  type: "ArrayPattern",
  elements: Array<PatternLike>,
  decorators?: Array<Decorator>,
  typeAnnotation?: TypeAnnotation,
};

export type ArrowFunctionExpression = Node & {
  type: "ArrowFunctionExpression",
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement | Expression,
  async?: boolean,
  expression?: boolean,
  generator?: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type ClassBody = Node & {
  type: "ClassBody",
  body: Array<
    ClassMethod | ClassPrivateMethod | ClassProperty | ClassPrivateProperty,
  >,
};

export type ClassDeclaration = Node & {
  type: "ClassDeclaration",
  id?: Identifier,
  superClass?: Expression,
  body: ClassBody,
  decorators?: Array<Decorator>,
  abstract?: boolean,
  declare?: boolean,
  mixins?: any,
  superTypeParameters?: TypeParameterInstantiation,
  typeParameters?: TypeParameterDeclaration,
};

export type ClassExpression = Node & {
  type: "ClassExpression",
  id?: Identifier,
  superClass?: Expression,
  body: ClassBody,
  decorators?: Array<Decorator>,
  mixins?: any,
  superTypeParameters?: TypeParameterInstantiation,
  typeParameters?: TypeParameterDeclaration,
};

export type ExportAllDeclaration = Node & {
  type: "ExportAllDeclaration",
  source: StringLiteral,
};

export type ExportDefaultDeclaration = Node & {
  type: "ExportDefaultDeclaration",
  declaration: FunctionDeclaration | ClassDeclaration | Expression,
};

export type ExportNamedDeclaration = Node & {
  type: "ExportNamedDeclaration",
  declaration?: Declaration,
  specifiers: Array<
    ExportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier,
  >,
  source?: StringLiteral,
  exportKind?: "type" | "value",
};

export type ExportSpecifier = Node & {
  type: "ExportSpecifier",
  local: Identifier,
  exported: Identifier,
};

export type ForOfStatement = Node & {
  type: "ForOfStatement",
  left: VariableDeclaration | LVal,
  right: Expression,
  body: Statement,
};

export type ImportDeclaration = Node & {
  type: "ImportDeclaration",
  specifiers: Array<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier,
  >,
  source: StringLiteral,
  importKind?: "type" | "typeof" | "value",
};

export type ImportDefaultSpecifier = Node & {
  type: "ImportDefaultSpecifier",
  local: Identifier,
};

export type ImportNamespaceSpecifier = Node & {
  type: "ImportNamespaceSpecifier",
  local: Identifier,
};

export type ImportSpecifier = Node & {
  type: "ImportSpecifier",
  local: Identifier,
  imported: Identifier,
  importKind?: "type" | "typeof",
};

export type MetaProperty = Node & {
  type: "MetaProperty",
  meta: Identifier,
  property: Identifier,
};

export type ClassMethod = Node & {
  type: "ClassMethod",
  kind?: "get" | "set" | "method" | "constructor",
  key: Identifier | StringLiteral | NumericLiteral | Expression,
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement,
  computed?: boolean,
  abstract?: boolean,
  access?: "public" | "private" | "protected",
  accessibility?: "public" | "private" | "protected",
  async?: boolean,
  decorators?: Array<Decorator>,
  generator?: boolean,
  optional?: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type ObjectPattern = Node & {
  type: "ObjectPattern",
  properties: Array<RestElement | ObjectProperty>,
  decorators?: Array<Decorator>,
  typeAnnotation?: TypeAnnotation,
};

export type SpreadElement = Node & {
  type: "SpreadElement",
  argument: Expression,
};

export type Super = Node & {
  type: "Super",
};

export type TaggedTemplateExpression = Node & {
  type: "TaggedTemplateExpression",
  tag: Expression,
  quasi: TemplateLiteral,
  typeParameters?: TypeParameterInstantiation,
};

export type TemplateElement = Node & {
  type: "TemplateElement",
  value: {raw: string, cooked?: string},
  tail?: boolean,
};

export type TemplateLiteral = Node & {
  type: "TemplateLiteral",
  quasis: Array<TemplateElement>,
  expressions: Array<Expression>,
};

export type YieldExpression = Node & {
  type: "YieldExpression",
  argument?: Expression,
  delegate?: boolean,
};

export type AnyTypeAnnotation = Node & {
  type: "AnyTypeAnnotation",
};

export type ArrayTypeAnnotation = Node & {
  type: "ArrayTypeAnnotation",
  elementType: FlowType,
};

export type BooleanTypeAnnotation = Node & {
  type: "BooleanTypeAnnotation",
};

export type BooleanLiteralTypeAnnotation = Node & {
  type: "BooleanLiteralTypeAnnotation",
  value: boolean,
};

export type NullLiteralTypeAnnotation = Node & {
  type: "NullLiteralTypeAnnotation",
};

export type ClassImplements = Node & {
  type: "ClassImplements",
  id: Identifier,
  typeParameters?: TypeParameterInstantiation,
};

export type DeclareClass = Node & {
  type: "DeclareClass",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  body: ObjectTypeAnnotation,
  mixins?: Array<InterfaceExtends>,
};

export type DeclareFunction = Node & {
  type: "DeclareFunction",
  id: Identifier,
  predicate?: DeclaredPredicate,
};

export type DeclareInterface = Node & {
  type: "DeclareInterface",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  body: ObjectTypeAnnotation,
  mixins?: Array<InterfaceExtends>,
};

export type DeclareModule = Node & {
  type: "DeclareModule",
  id: Identifier | StringLiteral,
  body: BlockStatement,
  kind?: "CommonJS" | "ES",
};

export type DeclareModuleExports = Node & {
  type: "DeclareModuleExports",
  typeAnnotation: TypeAnnotation,
};

export type DeclareTypeAlias = Node & {
  type: "DeclareTypeAlias",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  right: FlowType,
};

export type DeclareOpaqueType = Node & {
  type: "DeclareOpaqueType",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  supertype?: FlowType,
};

export type DeclareVariable = Node & {
  type: "DeclareVariable",
  id: Identifier,
};

export type DeclareExportDeclaration = Node & {
  type: "DeclareExportDeclaration",
  declaration?: Flow,
  specifiers?: Array<ExportSpecifier | ExportNamespaceSpecifier>,
  source?: StringLiteral,
};

export type DeclareExportAllDeclaration = Node & {
  type: "DeclareExportAllDeclaration",
  source: StringLiteral,
  exportKind?: "type" | "value",
};

export type DeclaredPredicate = Node & {
  type: "DeclaredPredicate",
  value: Flow,
};

export type ExistsTypeAnnotation = Node & {
  type: "ExistsTypeAnnotation",
};

export type FunctionTypeAnnotation = Node & {
  type: "FunctionTypeAnnotation",
  typeParameters?: TypeParameterDeclaration,
  params: Array<FunctionTypeParam>,
  rest?: FunctionTypeParam,
  returnType: FlowType,
};

export type FunctionTypeParam = Node & {
  type: "FunctionTypeParam",
  name?: Identifier,
  typeAnnotation: FlowType,
  optional?: boolean,
};

export type GenericTypeAnnotation = Node & {
  type: "GenericTypeAnnotation",
  id: Identifier | QualifiedTypeIdentifier,
  typeParameters?: TypeParameterInstantiation,
};

export type InferredPredicate = Node & {
  type: "InferredPredicate",
};

export type InterfaceExtends = Node & {
  type: "InterfaceExtends",
  id: Identifier | QualifiedTypeIdentifier,
  typeParameters?: TypeParameterInstantiation,
};

export type InterfaceDeclaration = Node & {
  type: "InterfaceDeclaration",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  body: ObjectTypeAnnotation,
  mixins?: Array<InterfaceExtends>,
};

export type InterfaceTypeAnnotation = Node & {
  type: "InterfaceTypeAnnotation",
  body: ObjectTypeAnnotation,
};

export type IntersectionTypeAnnotation = Node & {
  type: "IntersectionTypeAnnotation",
  types: Array<FlowType>,
};

export type MixedTypeAnnotation = Node & {
  type: "MixedTypeAnnotation",
};

export type EmptyTypeAnnotation = Node & {
  type: "EmptyTypeAnnotation",
};

export type NullableTypeAnnotation = Node & {
  type: "NullableTypeAnnotation",
  typeAnnotation: FlowType,
};

export type NumberLiteralTypeAnnotation = Node & {
  type: "NumberLiteralTypeAnnotation",
  value: number,
};

export type NumberTypeAnnotation = Node & {
  type: "NumberTypeAnnotation",
};

export type ObjectTypeAnnotation = Node & {
  type: "ObjectTypeAnnotation",
  properties: Array<ObjectTypeProperty | ObjectTypeSpreadProperty>,
  indexers?: Array<ObjectTypeIndexer>,
  callProperties?: Array<ObjectTypeCallProperty>,
  internalSlots?: Array<ObjectTypeInternalSlot>,
  exact?: boolean,
  inexact?: boolean,
};

export type ObjectTypeInternalSlot = Node & {
  type: "ObjectTypeInternalSlot",
  id: Identifier,
  value: FlowType,
  optional: boolean,
  method: boolean,
};

export type ObjectTypeCallProperty = Node & {
  type: "ObjectTypeCallProperty",
  value: FlowType,
};

export type ObjectTypeIndexer = Node & {
  type: "ObjectTypeIndexer",
  id?: Identifier,
  key: FlowType,
  value: FlowType,
  variance?: Variance,
};

export type ObjectTypeProperty = Node & {
  type: "ObjectTypeProperty",
  key: Identifier | StringLiteral,
  value: FlowType,
  variance?: Variance,
  kind?: "init" | "get" | "set",
  optional?: boolean,
  proto?: boolean,
};

export type ObjectTypeSpreadProperty = Node & {
  type: "ObjectTypeSpreadProperty",
  argument: FlowType,
};

export type OpaqueType = Node & {
  type: "OpaqueType",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  supertype?: FlowType,
  impltype: FlowType,
};

export type QualifiedTypeIdentifier = Node & {
  type: "QualifiedTypeIdentifier",
  id: Identifier,
  qualification: Identifier | QualifiedTypeIdentifier,
};

export type StringLiteralTypeAnnotation = Node & {
  type: "StringLiteralTypeAnnotation",
  value: string,
};

export type StringTypeAnnotation = Node & {
  type: "StringTypeAnnotation",
};

export type ThisTypeAnnotation = Node & {
  type: "ThisTypeAnnotation",
};

export type TupleTypeAnnotation = Node & {
  type: "TupleTypeAnnotation",
  types: Array<FlowType>,
};

export type TypeofTypeAnnotation = Node & {
  type: "TypeofTypeAnnotation",
  argument: FlowType,
};

export type TypeAlias = Node & {
  type: "TypeAlias",
  id: Identifier,
  typeParameters?: TypeParameterDeclaration,
  right: FlowType,
};

export type TypeAnnotation = Node & {
  type: "TypeAnnotation",
  typeAnnotation: FlowType,
};

export type TypeCastExpression = Node & {
  type: "TypeCastExpression",
  expression: Expression,
  typeAnnotation: TypeAnnotation,
};

export type TypeParameter = Node & {
  type: "TypeParameter",
  bound?: TypeAnnotation,
  variance?: Variance,
  name?: string,
};

export type TypeParameterDeclaration = Node & {
  type: "TypeParameterDeclaration",
  params: Array<TypeParameter>,
};

export type TypeParameterInstantiation = Node & {
  type: "TypeParameterInstantiation",
  params: Array<FlowType>,
};

export type UnionTypeAnnotation = Node & {
  type: "UnionTypeAnnotation",
  types: Array<FlowType>,
};

export type Variance = Node & {
  type: "Variance",
  kind: "minus" | "plus",
};

export type VoidTypeAnnotation = Node & {
  type: "VoidTypeAnnotation",
};

export type JSXAttribute = Node & {
  type: "JSXAttribute",
  name: JSXIdentifier | JSXNamespacedName,
  value?: JSXElement | JSXFragment | StringLiteral | JSXExpressionContainer,
};

export type JSXClosingElement = Node & {
  type: "JSXClosingElement",
  name: JSXIdentifier | JSXMemberExpression,
};

export type JSXElement = Node & {
  type: "JSXElement",
  openingElement: JSXOpeningElement,
  closingElement?: JSXClosingElement,
  children: Array<
    | JSXText
    | JSXExpressionContainer
    | JSXSpreadChild
    | JSXElement
    | JSXFragment,
  >,
  selfClosing: any,
};

export type JSXEmptyExpression = Node & {
  type: "JSXEmptyExpression",
};

export type JSXExpressionContainer = Node & {
  type: "JSXExpressionContainer",
  expression: Expression | JSXEmptyExpression,
};

export type JSXSpreadChild = Node & {
  type: "JSXSpreadChild",
  expression: Expression,
};

export type JSXIdentifier = Node & {
  type: "JSXIdentifier",
  name: string,
};

export type JSXMemberExpression = Node & {
  type: "JSXMemberExpression",
  object: JSXMemberExpression | JSXIdentifier,
  property: JSXIdentifier,
};

export type JSXNamespacedName = Node & {
  type: "JSXNamespacedName",
  namespace: JSXIdentifier,
  name: JSXIdentifier,
};

export type JSXOpeningElement = Node & {
  type: "JSXOpeningElement",
  name: JSXIdentifier | JSXMemberExpression,
  attributes: Array<JSXAttribute | JSXSpreadAttribute>,
  selfClosing?: boolean,
  typeParameters?: TypeParameterInstantiation,
};

export type JSXSpreadAttribute = Node & {
  type: "JSXSpreadAttribute",
  argument: Expression,
};

export type JSXText = Node & {
  type: "JSXText",
  value: string,
};

export type JSXFragment = Node & {
  type: "JSXFragment",
  openingFragment: JSXOpeningFragment,
  closingFragment: JSXClosingFragment,
  children: Array<
    | JSXText
    | JSXExpressionContainer
    | JSXSpreadChild
    | JSXElement
    | JSXFragment,
  >,
};

export type JSXOpeningFragment = Node & {
  type: "JSXOpeningFragment",
};

export type JSXClosingFragment = Node & {
  type: "JSXClosingFragment",
};

export type Placeholder = Node & {
  type: "Placeholder",
  expectedNode:
    | "Identifier"
    | "StringLiteral"
    | "Expression"
    | "Statement"
    | "Declaration"
    | "BlockStatement"
    | "ClassBody"
    | "Pattern",
  name: Identifier,
};

export type ArgumentPlaceholder = Node & {
  type: "ArgumentPlaceholder",
};

export type AwaitExpression = Node & {
  type: "AwaitExpression",
  argument: Expression,
};

export type BindExpression = Node & {
  type: "BindExpression",
  object: any,
  callee: any,
};

export type ClassProperty = Node & {
  type: "ClassProperty",
  key: Identifier | StringLiteral | NumericLiteral | Expression,
  value?: Expression,
  typeAnnotation?: TypeAnnotation,
  decorators?: Array<Decorator>,
  computed?: boolean,
  abstract?: boolean,
  accessibility?: "public" | "private" | "protected",
  definite?: boolean,
  optional?: boolean,
  readonly?: boolean,
};

export type OptionalMemberExpression = Node & {
  type: "OptionalMemberExpression",
  object: Expression,
  property: any,
  computed?: boolean,
  optional: boolean,
};

export type PipelineTopicExpression = Node & {
  type: "PipelineTopicExpression",
  expression: Expression,
};

export type PipelineBareFunction = Node & {
  type: "PipelineBareFunction",
  callee: Expression,
};

export type PipelinePrimaryTopicReference = Node & {
  type: "PipelinePrimaryTopicReference",
};

export type OptionalCallExpression = Node & {
  type: "OptionalCallExpression",
  callee: Expression,
  arguments: Array<Expression | SpreadElement | JSXNamespacedName>,
  optional: boolean,
  typeArguments?: TypeParameterInstantiation,
};

export type ClassPrivateProperty = Node & {
  type: "ClassPrivateProperty",
  key: PrivateName,
  value?: Expression,
};

export type ClassPrivateMethod = Node & {
  type: "ClassPrivateMethod",
  kind?: "get" | "set" | "method" | "constructor",
  key: PrivateName,
  params: Array<Identifier | Pattern | RestElement>,
  body: BlockStatement,
  abstract?: boolean,
  access?: "public" | "private" | "protected",
  accessibility?: "public" | "private" | "protected",
  async?: boolean,
  computed?: boolean,
  decorators?: Array<Decorator>,
  generator?: boolean,
  optional?: boolean,
  returnType?: any,
  typeParameters?: any,
};

export type Import = Node & {
  type: "Import",
};

export type Decorator = Node & {
  type: "Decorator",
  expression: Expression,
};

export type DoExpression = Node & {
  type: "DoExpression",
  body: BlockStatement,
};

export type ExportDefaultSpecifier = Node & {
  type: "ExportDefaultSpecifier",
  exported: Identifier,
};

export type ExportNamespaceSpecifier = Node & {
  type: "ExportNamespaceSpecifier",
  exported: Identifier,
};

export type PrivateName = Node & {
  type: "PrivateName",
  id: Identifier,
};

export type BigIntLiteral = Node & {
  type: "BigIntLiteral",
  value: string,
};

export type Expression =
  | ArrayExpression
  | AssignmentExpression
  | BinaryExpression
  | CallExpression
  | ConditionalExpression
  | FunctionExpression
  | Identifier
  | StringLiteral
  | NumericLiteral
  | NullLiteral
  | BooleanLiteral
  | RegExpLiteral
  | LogicalExpression
  | MemberExpression
  | NewExpression
  | ObjectExpression
  | SequenceExpression
  | ParenthesizedExpression
  | ThisExpression
  | UnaryExpression
  | UpdateExpression
  | ArrowFunctionExpression
  | ClassExpression
  | MetaProperty
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | YieldExpression
  | TypeCastExpression
  | JSXElement
  | JSXFragment
  | AwaitExpression
  | BindExpression
  | OptionalMemberExpression
  | PipelinePrimaryTopicReference
  | OptionalCallExpression
  | Import
  | DoExpression
  | BigIntLiteral;
export type Binary = BinaryExpression | LogicalExpression;
export type Scopable =
  | BlockStatement
  | CatchClause
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Program
  | ObjectMethod
  | SwitchStatement
  | WhileStatement
  | ArrowFunctionExpression
  | ClassDeclaration
  | ClassExpression
  | ForOfStatement
  | ClassMethod
  | ClassPrivateMethod;
export type BlockParent =
  | BlockStatement
  | CatchClause
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Program
  | ObjectMethod
  | SwitchStatement
  | WhileStatement
  | ArrowFunctionExpression
  | ForOfStatement
  | ClassMethod
  | ClassPrivateMethod;
export type Block = BlockStatement | Program;
export type Statement =
  | BlockStatement
  | BreakStatement
  | ClassDeclaration
  | ContinueStatement
  | DebuggerStatement
  | DeclareClass
  | DeclareExportAllDeclaration
  | DeclareExportDeclaration
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareModuleExports
  | DeclareOpaqueType
  | DeclareTypeAlias
  | DeclareVariable
  | DoWhileStatement
  | EmptyStatement
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | IfStatement
  | ImportDeclaration
  | InterfaceDeclaration
  | LabeledStatement
  | OpaqueType
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | TypeAlias
  | VariableDeclaration
  | WhileStatement
  | WithStatement;
export type Terminatorless =
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement
  | YieldExpression
  | AwaitExpression;
export type CompletionStatement =
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement;
export type Conditional = ConditionalExpression | IfStatement;
export type Loop =
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | WhileStatement
  | ForOfStatement;
export type While = DoWhileStatement | WhileStatement;
export type ExpressionWrapper =
  | ExpressionStatement
  | ParenthesizedExpression
  | TypeCastExpression;
export type For = ForInStatement | ForStatement | ForOfStatement;
export type ForXStatement = ForInStatement | ForOfStatement;
export type Function =
  | FunctionDeclaration
  | FunctionExpression
  | ObjectMethod
  | ArrowFunctionExpression
  | ClassMethod
  | ClassPrivateMethod;
export type FunctionParent =
  | FunctionDeclaration
  | FunctionExpression
  | ObjectMethod
  | ArrowFunctionExpression
  | ClassMethod
  | ClassPrivateMethod;
export type Pureish =
  | FunctionDeclaration
  | FunctionExpression
  | StringLiteral
  | NumericLiteral
  | NullLiteral
  | BooleanLiteral
  | ArrowFunctionExpression
  | ClassDeclaration
  | ClassExpression
  | BigIntLiteral;
export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | ClassDeclaration
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareModuleExports
  | DeclareTypeAlias
  | DeclareOpaqueType
  | DeclareVariable
  | DeclareExportDeclaration
  | DeclareExportAllDeclaration
  | InterfaceDeclaration
  | OpaqueType
  | TypeAlias;
export type PatternLike =
  | Identifier
  | RestElement
  | AssignmentPattern
  | ArrayPattern
  | ObjectPattern;
export type LVal =
  | Identifier
  | MemberExpression
  | RestElement
  | AssignmentPattern
  | ArrayPattern
  | ObjectPattern;
export type Literal =
  | StringLiteral
  | NumericLiteral
  | NullLiteral
  | BooleanLiteral
  | RegExpLiteral
  | TemplateLiteral
  | BigIntLiteral;
export type Immutable =
  | StringLiteral
  | NumericLiteral
  | NullLiteral
  | BooleanLiteral
  | JSXAttribute
  | JSXClosingElement
  | JSXElement
  | JSXExpressionContainer
  | JSXSpreadChild
  | JSXOpeningElement
  | JSXText
  | JSXFragment
  | JSXOpeningFragment
  | JSXClosingFragment
  | BigIntLiteral;
export type UserWhitespacable =
  | ObjectMethod
  | ObjectProperty
  | ObjectTypeInternalSlot
  | ObjectTypeCallProperty
  | ObjectTypeIndexer
  | ObjectTypeProperty
  | ObjectTypeSpreadProperty;
export type Method = ObjectMethod | ClassMethod | ClassPrivateMethod;
export type ObjectMember = ObjectMethod | ObjectProperty;
export type Property = ObjectProperty | ClassProperty | ClassPrivateProperty;
export type UnaryLike = UnaryExpression | SpreadElement;
export type Pattern = AssignmentPattern | ArrayPattern | ObjectPattern;
export type Class = ClassDeclaration | ClassExpression;
export type ModuleDeclaration =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration;
export type ExportDeclaration =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration;
export type ModuleSpecifier =
  | ExportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier
  | ExportDefaultSpecifier
  | ExportNamespaceSpecifier;
export type Flow =
  | AnyTypeAnnotation
  | ArrayTypeAnnotation
  | BooleanTypeAnnotation
  | BooleanLiteralTypeAnnotation
  | NullLiteralTypeAnnotation
  | ClassImplements
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareModuleExports
  | DeclareTypeAlias
  | DeclareOpaqueType
  | DeclareVariable
  | DeclareExportDeclaration
  | DeclareExportAllDeclaration
  | DeclaredPredicate
  | ExistsTypeAnnotation
  | FunctionTypeAnnotation
  | FunctionTypeParam
  | GenericTypeAnnotation
  | InferredPredicate
  | InterfaceExtends
  | InterfaceDeclaration
  | InterfaceTypeAnnotation
  | IntersectionTypeAnnotation
  | MixedTypeAnnotation
  | EmptyTypeAnnotation
  | NullableTypeAnnotation
  | NumberLiteralTypeAnnotation
  | NumberTypeAnnotation
  | ObjectTypeAnnotation
  | ObjectTypeInternalSlot
  | ObjectTypeCallProperty
  | ObjectTypeIndexer
  | ObjectTypeProperty
  | ObjectTypeSpreadProperty
  | OpaqueType
  | QualifiedTypeIdentifier
  | StringLiteralTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | TupleTypeAnnotation
  | TypeofTypeAnnotation
  | TypeAlias
  | TypeAnnotation
  | TypeCastExpression
  | TypeParameter
  | TypeParameterDeclaration
  | TypeParameterInstantiation
  | UnionTypeAnnotation
  | Variance
  | VoidTypeAnnotation;
export type FlowType =
  | AnyTypeAnnotation
  | ArrayTypeAnnotation
  | BooleanTypeAnnotation
  | BooleanLiteralTypeAnnotation
  | NullLiteralTypeAnnotation
  | ExistsTypeAnnotation
  | FunctionTypeAnnotation
  | GenericTypeAnnotation
  | InterfaceTypeAnnotation
  | IntersectionTypeAnnotation
  | MixedTypeAnnotation
  | EmptyTypeAnnotation
  | NullableTypeAnnotation
  | NumberLiteralTypeAnnotation
  | NumberTypeAnnotation
  | ObjectTypeAnnotation
  | StringLiteralTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | TupleTypeAnnotation
  | TypeofTypeAnnotation
  | UnionTypeAnnotation
  | VoidTypeAnnotation;
export type FlowBaseAnnotation =
  | AnyTypeAnnotation
  | BooleanTypeAnnotation
  | NullLiteralTypeAnnotation
  | MixedTypeAnnotation
  | EmptyTypeAnnotation
  | NumberTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | VoidTypeAnnotation;
export type FlowDeclaration =
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareModuleExports
  | DeclareTypeAlias
  | DeclareOpaqueType
  | DeclareVariable
  | DeclareExportDeclaration
  | DeclareExportAllDeclaration
  | InterfaceDeclaration
  | OpaqueType
  | TypeAlias;
export type FlowPredicate = DeclaredPredicate | InferredPredicate;
export type JSX =
  | JSXAttribute
  | JSXClosingElement
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXSpreadChild
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXSpreadAttribute
  | JSXText
  | JSXFragment
  | JSXOpeningFragment
  | JSXClosingFragment;
export type Private = ClassPrivateProperty | ClassPrivateMethod | PrivateName;
