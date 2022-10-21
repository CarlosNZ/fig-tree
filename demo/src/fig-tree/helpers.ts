import { mapKeys, camelCase } from 'lodash'
import { OutputType, EvaluatorNode, CombinedOperatorNode, Operator, EvaluatorOutput } from './types'

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

export const truncateString = (string: string, length: number = 200) =>
  string.length < length ? string : `${string.slice(0, length - 2).trim()}...`

export const fallbackOrError = (
  fallback: any,
  errorMessage: string,
  returnErrorAsString: boolean = false
) => {
  if (fallback !== undefined) return fallback
  if (returnErrorAsString) return truncateString(errorMessage)
  else throw new Error(truncateString(errorMessage))
}

/*
Converts Evaluator node to one with canonical property names,
as per each operator's property aliases
*/
export const mapPropertyAliases = (
  propertyAliases: { [key: string]: string },
  expression: CombinedOperatorNode
): CombinedOperatorNode =>
  mapKeys(expression, (_, key: string) =>
    key in propertyAliases ? propertyAliases[key] : key
  ) as CombinedOperatorNode

/*
Checks Evaluator node for missing required properties based on operator type
- Strict type checking done AFTER evaluation of child nodes within operator
  methods
*/
export const checkRequiredNodes = (
  requiredProps: readonly string[],
  expression: CombinedOperatorNode
): string | false => {
  const missingProps = requiredProps.filter((prop) => !(prop in expression))
  if (missingProps.length === 0) return false
  if (!('children' in expression)) return `Missing properties: ${missingProps}`
  return false
}

export const convertOutputMethods: {
  [key in OutputType]: <T>(value: T) => EvaluatorOutput | T[]
} = {
  number: (value: EvaluatorOutput) => extractNumber(value),
  string: (value: EvaluatorOutput) => String(value),
  array: (value: EvaluatorOutput) => (Array.isArray(value) ? value : [value]),
  boolean: (value: EvaluatorOutput) => Boolean(value),
  bool: (value: EvaluatorOutput) => Boolean(value),
}

// Workaround to prevent typescript errors for err.message
export const errorMessage = (err: unknown) => (err as Error).message

// Extracts numeric content from a string
const extractNumber = (input: EvaluatorOutput) => {
  if (typeof input !== 'string') return Number.isNaN(Number(input)) ? input : Number(input)

  const numberMatch = input.match(/(-?(\d+\.\d+))|(-?((?<!\.)\.\d+))|(-?\d+)/gm)
  if (!numberMatch) return 0
  return Number(numberMatch[0])
}
