import { mapKeys, camelCase } from 'lodash'
import { OutputType, EvaluatorNode, CombinedOperatorNode, Operator, ValueNode } from './types'

export const parseIfJson = (input: EvaluatorNode) => {
  if (typeof input !== 'string') return input
  try {
    const parsedInput = JSON.parse(input)
    return isOperatorNode(parsedInput) ? parsedInput : input
  } catch (err) {
    return input
  }
}

export const isOperatorNode = (input: EvaluatorNode) =>
  input instanceof Object && 'operator' in input

const standardiseOperatorName = (name: string) => {
  const camelCaseName = camelCase(name)
  return camelCaseName ? camelCaseName : name
}

export const getOperatorName = (operator: string, operatorAliases: { [key: string]: Operator }) =>
  operatorAliases[standardiseOperatorName(operator)]

export const fallbackOrError = (
  fallback: any,
  errorMessage: string,
  returnErrorAsString: boolean = false
) => {
  if (fallback !== undefined) return fallback
  if (returnErrorAsString) return errorMessage
  else throw new Error(errorMessage)
}

export const mapPropertyAliases = (
  propertyAliases: { [key: string]: string },
  expression: CombinedOperatorNode
): CombinedOperatorNode =>
  mapKeys(expression, (_, key: string) =>
    key in propertyAliases ? propertyAliases[key] : key
  ) as CombinedOperatorNode

export const checkRequiredNodes = (
  requiredProps: readonly string[],
  expression: CombinedOperatorNode
): string | false => {
  const missingProps = requiredProps.filter((prop) => !(prop in expression))
  if (missingProps.length === 0) return false
  if (!('children' in expression)) return `Missing properties: ${missingProps}`
  if (!Array.isArray(expression.children)) {
    return 'Invalid child nodes (children) array'
  } else return false
}

export const convertOutputMethods: {
  [key in OutputType]: <T>(val: T) => ValueNode | T[]
} = {
  number: (value: ValueNode) => (Number.isNaN(Number(value)) ? value : Number(value)),
  string: (value: ValueNode) => String(value),
  array: (value: ValueNode) => (Array.isArray(value) ? value : [value]),
  boolean: (value: ValueNode) => Boolean(value),
  bool: (value: ValueNode) => Boolean(value),
}

// Workaround to prevent typescript errors for err.message
export const errorMessage = (err: unknown) => (err as Error).message
