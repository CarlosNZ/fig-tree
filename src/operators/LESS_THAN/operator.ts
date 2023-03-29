import { parseChildren, BasicExtendedNode } from '../AND/operator'
import { evaluateArray, getTypeCheckInput } from '../_operatorUtils'
import { FigTreeConfig, OperatorObject } from '../../types'
import { ComparatorNode } from '../'
import operatorData, { propertyAliases } from './data'

// const aliasExtensions = [{ '<=': { strict: false } }] // To-do - Issue #22

const evaluate = async (expression: ComparatorNode, config: FigTreeConfig): Promise<boolean> => {
  const [values, strict = true] = (await evaluateArray(
    [expression.values, expression.strict],
    config
  )) as [(string | number)[], boolean]

  config.typeChecker(getTypeCheckInput(operatorData.parameters, { values, strict }))

  if (values.length < 2) throw new Error('- Not enough values provided')

  const [first, second] = values

  if (first === second && !strict) return true

  return first < second
}

export const LESS_THAN: OperatorObject = {
  propertyAliases,
  operatorData,
  evaluate,
  parseChildren,
}
