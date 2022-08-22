import { parseChildren, BasicExtendedNode } from './logicalAnd'
import { evaluateArray } from './_operatorUtils'
import { EvaluatorConfig, OperatorObject } from '../types'

const requiredProperties = ['values'] as const
const operatorAliases = ['or', '|', '||']
const propertyAliases = {}

const evaluate = async (
  expression: BasicExtendedNode,
  config: EvaluatorConfig
): Promise<boolean> => {
  const values = (await evaluateArray(expression.values, config)) as boolean[]
  config.typeChecker({ name: 'values', value: values, expectedType: 'array' })
  return values.reduce((acc: boolean, val: boolean) => acc || !!val, false)
}

export const OR: OperatorObject = {
  requiredProperties,
  operatorAliases,
  propertyAliases,
  evaluate,
  parseChildren,
}
