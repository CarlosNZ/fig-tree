/*
The core evaluation function used by FigTreeEvaluator
*/

import {
  FigTreeConfig,
  EvaluatorNode,
  EvaluatorOutput,
  OutputType,
  CombinedOperatorNode,
} from './types'
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
  replaceAliasNodeValues,
  evaluateObject,
  isFragmentNode,
  isObject,
  evaluateAliasNodes,
} from './helpers'

export const evaluatorFunction = async (
  input: EvaluatorNode,
  config: FigTreeConfig
): Promise<EvaluatorOutput> => {
  const { options, operators, operatorAliases } = config

  let expression = options?.allowJSONStringInput ? parseIfJson(input) : input

  // If an array, we evaluate each item in the array
  if (Array.isArray(expression)) {
    expression = await evaluateArray(expression, config)
  }

  const isOperator = isOperatorNode(expression)
  const isFragment = isFragmentNode(expression)

  // If "evaluateFullObject" option is on, dive deep into objects to find
  // Operator Nodes
  if (options.evaluateFullObject && !isOperator && !isFragment)
    return await replaceAliasNodeValues(await evaluateObject(expression, config), config)

  // Base case -- Non-operator (leaf) nodes get returned unmodified (or
  // substituted if an alias reference)
  if (!isOperator && !isFragment) {
    // Return deprecated (< v1) "value" nodes
    if (options.supportDeprecatedValueNodes && isObject(expression) && 'value' in expression)
      return expression.value

    return await replaceAliasNodeValues(expression, config)
  }

  const { fallback } = expression
  const returnErrorAsString = options?.returnErrorAsString ?? false

  // Replace any fragments with their full expressions
  if (isFragment) {
    const [fragment, parameters] = (await evaluateArray(
      [expression.fragment, expression.parameters],
      config
    )) as [string, { [key: string]: EvaluatorNode }]
    const fragmentReplacement = options?.fragments?.[fragment]
    if (fragmentReplacement === undefined)
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        `Fragment not defined: ${fragment}`,
        returnErrorAsString
      )
    if (!isOperatorNode(fragmentReplacement)) return fragmentReplacement
    expression = { ...expression, ...(fragmentReplacement as CombinedOperatorNode), ...parameters }
    delete expression.fragment
    delete expression.parameters
  }

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

    // Accumulate alias nodes so that they can be evaluated as required
    evaluateAliasNodes(expression, config)

    const validationError = checkRequiredNodes(requiredProperties, expression)
    if (validationError)
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        `Operator: ${operator}\n- ${validationError}`,
        returnErrorAsString
      )

    // If using "children" property, convert children array to expected
    // properties
    if ('children' in expression) {
      if (!Array.isArray(expression.children))
        expression.children = await evaluatorFunction(expression.children, config)
      if (!Array.isArray(expression.children))
        return fallbackOrError(
          await evaluatorFunction(fallback, config),
          `Operator: ${operator}\n- Property "children" is not of type: array`,
          returnErrorAsString
        )
      expression = await parseChildren(expression, config)
    }

    // Recursively evaluate node
    let result
    try {
      result = await evaluate(expression, config)
    } catch (err) {
      result = fallbackOrError(
        await evaluatorFunction(expression.fallback, config),
        `Operator: ${operator}:\n${errorMessage(err)}`,
        returnErrorAsString
      )
    }

    const outputType = expression?.outputType ?? expression?.type
    if (!outputType) return result

    const evaluatedOutputType = (await evaluatorFunction(outputType, config)) as OutputType

    // Output type conversion
    if (!(evaluatedOutputType in convertOutputMethods))
      return fallbackOrError(
        await evaluatorFunction(fallback, config),
        `Operator: ${operator}\n- Invalid output type: ${evaluatedOutputType}`,
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
