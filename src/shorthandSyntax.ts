import { EvaluatorNode, OperatorAliases, Fragments, FragmentNode } from './types'
import { getOperatorName, isFragmentNode, isOperatorNode, isObject, isAliasString } from './helpers'
import opAliases from './operators/_operatorAliases.json'

const operatorAliases = opAliases as OperatorAliases // Set type for JSON object

const functionStringRegex = /\$([^\(\)]+)\((.*)\)/

export const preProcessShorthand = (
  expression: object | string,
  fragments: Fragments = {}
): EvaluatorNode | FragmentNode => {
  if (typeof expression === 'string') return processString(expression, fragments)

  if (isObject(expression)) return processObject(expression, fragments)

  return expression
}

const processString = (expString: string, fragments: Fragments): EvaluatorNode => {
  const match = functionStringRegex.exec(expString)
  if (!match) return expString

  const method = match[1].trim()
  const params = match[2].split(',').map((p) => preProcessShorthand(p.trim()))

  return buildEvaluatorNode(method, params, fragments)
}

const processObject = (expObject: object, fragments: Fragments) => {
  if (isOperatorNode(expObject) || isFragmentNode(expObject)) return expObject

  const keyVals = Object.entries(expObject)
  if (keyVals.length !== 1) return expObject

  const [alias, params] = keyVals[0]

  if (!isAliasString(alias)) return expObject

  const processedParams: object = Array.isArray(params)
    ? params.map((p) => preProcessShorthand(p))
    : isObject(params)
    ? processParameterObject(params)
    : params

  return buildEvaluatorNode(alias.slice(1), processedParams, fragments)
}

const buildEvaluatorNode = (alias: string, params: any[] | object, fragments: Fragments) => {
  const operator = getOperatorName(alias, operatorAliases)

  if (operator) {
    if (Array.isArray(params)) return { operator, children: params }
    if (isObject(params)) return { operator, ...params }
    return { operator, children: [params] }
  }

  if (alias in fragments) {
    return { fragment: alias, ...params }
  }
}

const processParameterObject = (params: object) => {
  const keyVals = Object.entries(params)
  const processed: Record<string, any> = {}

  keyVals.forEach(([key, value]) => {
    processed[key] = preProcessShorthand(value)
  })

  return processed
}
