import { parseChildren } from '../AND/operator'
import { getTypeCheckInput } from '../operatorUtils'
import { evaluateArray } from '../../evaluate'
import { OperatorObject, EvaluateMethod } from '../../types'
import operatorData, { propertyAliases } from './data'
import { isObject } from '../../helpers'

const evaluate: EvaluateMethod = async (expression, config) => {
  // eslint-disable-next-line -- any is fine for the following cases
  const values = (await evaluateArray(expression.values, config)) as any[]

  config.typeChecker(
    getTypeCheckInput(operatorData.parameters, {
      values,
      type: expression.type,
    })
  )

  if (values.length === 0) return values // To prevent reduce of empty array error

  // Reduce based on "type" if specified
  if (expression?.type === 'string') return values.reduce((acc, child) => acc.concat(child), '')

  if (expression?.type === 'array') return values.reduce((acc, child) => acc.concat(child), [])

  // Concatenate arrays/strings
  if (values.every((child) => typeof child === 'string' || Array.isArray(child)))
    return values.reduce((acc, child) => acc.concat(child as string))

  // Merge objects
  if (values.every((child) => isObject(child)))
    return values.reduce((acc, child) => ({ ...acc, ...child }), {})

  // Or just try to add any other types
  return values.reduce((acc: number, child: number) => acc + child)
}

export const PLUS: OperatorObject = {
  propertyAliases,
  operatorData,
  evaluate,
  parseChildren,
}
