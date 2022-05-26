import { parseChildren, BasicExtendedNode } from './logicalAnd'
import { evaluateArray } from './_helpers'
import { EvaluatorConfig, OperatorObject } from '../types'

const requiredProperties = ['values']
const operatorAliases = ['or', '|', '||']
const propertyAliases = {}

const evaluate = async (
  expression: BasicExtendedNode,
  config: EvaluatorConfig
): Promise<Boolean> => {
  const values = (await evaluateArray(expression.values, config)) as boolean[]
  return values.reduce((acc: boolean, val: boolean) => acc || val, false)
}

export const OR: OperatorObject = {
  requiredProperties,
  operatorAliases,
  propertyAliases,
  evaluate,
  parseChildren,
}
