import { EvaluatorConfig, EvaluatorNode, EvaluatorOutput, OutputType } from './types'
import { evaluateArray } from './operators/_operatorUtils'
import {
  checkRequiredNodes,
  fallbackOrError,
  convertOutputMethods,
  errorMessage,
  parseIfJson,
  isOperatorNode,
  mapPropertyAliases,
  getOperatorName,
} from './helpers'

export const evaluatorFunction = async (
  input: EvaluatorNode,
  config: EvaluatorConfig
): Promise<EvaluatorOutput> => {
  const { options, operators, operatorAliases } = config

  let expression = options?.allowJSONStringInput ? parseIfJson(input) : input

  // If an array, we evaluate each item in the array
  if (Array.isArray(expression)) {
    expression = await evaluateArray(expression, config)
  }

  // Base case -- Non-operator nodes get returned unmodified
  if (!isOperatorNode(expression)) return expression

  const { fallback } = expression
  const returnErrorAsString = options?.returnErrorAsString ?? false

  try {
    const operator = getOperatorName(expression.operator, operatorAliases)

    if (!operator)
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        `Invalid operator: ${expression.operator}`,
        returnErrorAsString
      )

    const { requiredProperties, propertyAliases, evaluate, parseChildren } = operators[operator]

    expression = mapPropertyAliases(propertyAliases, expression)

    const validationError = checkRequiredNodes(requiredProperties, expression)
    if (validationError)
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        validationError,
        returnErrorAsString
      )

    if ('children' in expression) {
      if (!Array.isArray(expression.children))
        expression.children = await evaluatorFunction(expression.children, config)
      if (!Array.isArray(expression.children))
        return fallbackOrError(
          await evaluatorFunction(fallback, config),
          `"children" property doesn't evaluate to array: ${expression.children}`,
          returnErrorAsString
        )
      expression = await parseChildren(expression, config)
    }

    // Recursively evaluate node
    const result = await evaluate(expression, config)

    const outputType = expression?.outputType ?? expression?.type
    if (!outputType) return result

    const evaluatedOutputType = (await evaluatorFunction(outputType, config)) as OutputType

    // Output type conversion
    if (!(evaluatedOutputType in convertOutputMethods))
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        `Invalid output type: ${evaluatedOutputType}`,
        returnErrorAsString
      )
    else {
      return convertOutputMethods[evaluatedOutputType](result)
    }
  } catch (err) {
    return fallbackOrError(
      await evaluatorFunction(fallback, config),
      errorMessage(err),
      returnErrorAsString
    )
  }
}
