import { camelCase } from 'change-case'
import {
  OutputType,
  EvaluatorNode,
  CombinedOperatorNode,
  Operator,
  EvaluatorOutput,
  FigTreeOptions,
} from './types'

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

// Convert to camelCase but *don't* remove stand-alone punctuation as they may
// be valid operators (e.g. "+", "?")
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
  mapObjectKeys(expression, (key: string) =>
    key in propertyAliases ? propertyAliases[key] : key
  ) as CombinedOperatorNode

/*
Convert object to a new object with keys changed by mapFunction
Simplified version of lodash' `mapKeys` method
*/
const mapObjectKeys = <T>(
  inputObj: { [key: string]: T },
  mapFunction: (key: string) => string
): { [key: string]: T } => {
  const keyVals = Object.entries(inputObj)
  const mappedKeys = keyVals.map(([key, value]) => [mapFunction(key), value])
  return Object.fromEntries(mappedKeys)
}

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

export const mergeOptions = (
  origOptions: FigTreeOptions,
  newOptions: FigTreeOptions
): FigTreeOptions => {
  const combinedOptions: FigTreeOptions = { ...origOptions, ...newOptions }
  // Mostly we can just merge the options objects, but for "objects",
  // "functions", and "headers", they  might need merging seperately so we
  // preserve deep merging.
  if (origOptions.objects || newOptions.objects)
    combinedOptions.objects = { ...origOptions.objects, ...newOptions.objects }
  if (origOptions.functions || newOptions.functions)
    combinedOptions.functions = { ...origOptions.functions, ...newOptions.functions }
  if (origOptions.headers || newOptions.headers)
    combinedOptions.headers = { ...origOptions.headers, ...newOptions.headers }

  return combinedOptions
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
