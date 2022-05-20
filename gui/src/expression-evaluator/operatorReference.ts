import {
  EvaluatorNode,
  Operator,
  OperatorNode,
  OperatorReference,
  ValueNode,
  OperationInput,
} from './types'
import {
  logicalAnd,
  logicalOr,
  equal,
  notEqual,
  plus,
  conditional,
  regex,
  objectProperties,
  stringSubstitution,
  pgSQL,
  graphQL,
  getRequest,
  postRequest,
  objectFunctions,
  buildObject,
} from './operators'

export const operatorMethods: {
  [key in Operator]: {
    parse: (expression: OperatorNode) => EvaluatorNode[]
    operate: ({ children, expression, options }: OperationInput) => ValueNode | Promise<ValueNode>
  }
} = {
  AND: {
    parse: logicalAnd.parse,
    operate: logicalAnd.operate,
  },
  OR: {
    parse: logicalOr.parse,
    operate: logicalOr.operate,
  },
  EQUAL: {
    parse: equal.parse,
    operate: equal.operate,
  },
  NOT_EQUAL: {
    parse: notEqual.parse,
    operate: notEqual.operate,
  },
  PLUS: {
    parse: plus.parse,
    operate: plus.operate,
  },
  CONDITIONAL: {
    parse: conditional.parse,
    operate: conditional.operate,
  },
  REGEX: {
    parse: regex.parse,
    operate: regex.operate,
  },
  OBJECT_PROPERTIES: {
    parse: objectProperties.parse,
    operate: objectProperties.operate,
  },
  STRING_SUBSTITUTION: {
    parse: stringSubstitution.parse,
    operate: stringSubstitution.operate,
  },
  PG_SQL: {
    parse: pgSQL.parse,
    operate: pgSQL.operate,
  },
  GRAPHQL: {
    parse: graphQL.parse,
    operate: graphQL.operate,
  },
  GET: {
    parse: getRequest.parse,
    operate: getRequest.operate,
  },
  POST: {
    parse: postRequest.parse,
    operate: postRequest.operate,
  },
  BUILD_OBJECT: {
    parse: buildObject.parse,
    operate: buildObject.operate,
  },
  OBJECT_FUNCTIONS: {
    parse: objectFunctions.parse,
    operate: objectFunctions.operate,
  },
}

// Converts from a range of allowed operator names into their canonical form
export const operatorReference: OperatorReference = {
  and: 'AND',
  '&': 'AND',
  '&&': 'AND',
  or: 'OR',
  '|': 'OR',
  '||': 'OR',
  '=': 'EQUAL',
  eq: 'EQUAL',
  equal: 'EQUAL',
  equals: 'EQUAL',
  '!=': 'NOT_EQUAL',
  '!': 'NOT_EQUAL',
  ne: 'NOT_EQUAL',
  notEqual: 'NOT_EQUAL',
  '+': 'PLUS',
  plus: 'PLUS',
  add: 'PLUS',
  concat: 'PLUS',
  join: 'PLUS',
  merge: 'PLUS',
  '?': 'CONDITIONAL',
  conditional: 'CONDITIONAL',
  ifThen: 'CONDITIONAL',
  regex: 'REGEX',
  patternMatch: 'REGEX',
  regexp: 'REGEX',
  matchPattern: 'REGEX',
  objectProperties: 'OBJECT_PROPERTIES',
  objProps: 'OBJECT_PROPERTIES',
  getProperty: 'OBJECT_PROPERTIES',
  getObjProp: 'OBJECT_PROPERTIES',
  stringSubstitution: 'STRING_SUBSTITUTION',
  substitute: 'STRING_SUBSTITUTION',
  stringSub: 'STRING_SUBSTITUTION',
  replace: 'STRING_SUBSTITUTION',
  pgSQL: 'PG_SQL',
  sql: 'PG_SQL',
  postgres: 'PG_SQL',
  pg: 'PG_SQL',
  pgDB: 'PG_SQL',
  graphQL: 'GRAPHQL',
  gql: 'GRAPHQL',
  get: 'GET',
  api: 'GET',
  post: 'POST',
  buildObject: 'BUILD_OBJECT',
  build: 'BUILD_OBJECT',
  object: 'BUILD_OBJECT',
  objectFunctions: 'OBJECT_FUNCTIONS',
  function: 'OBJECT_FUNCTIONS',
  functions: 'OBJECT_FUNCTIONS',
  runFunction: 'OBJECT_FUNCTIONS',
}
