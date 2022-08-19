import { parseChildren, BasicExtendedNode } from './logicalAnd'
import { evaluateArray } from './_operatorUtils'
import { EvaluatorNode, EvaluatorConfig, OperatorObject, BaseOperatorNode } from '../types'
import { evaluateExpression } from '../evaluator'

const requiredProperties = [] as const
const operatorAliases = ['/', 'divide', '÷']
const propertyAliases = { divide: 'dividend', by: 'divisor', divideBy: 'divisor' }

interface DivisionNodeWithProps extends BaseOperatorNode {
  dividend: EvaluatorNode
  divisor: EvaluatorNode
}

export type DivisionNode = BasicExtendedNode &
  DivisionNodeWithProps & { output?: 'quotient' | 'remainder' }

const evaluate = async (expression: DivisionNode, config: EvaluatorConfig): Promise<number> => {
  const values = (await evaluateArray(
    expression.values ?? [expression.dividend, expression.divisor],
    config
  )) as number[]

  config.typeChecker({ name: 'values', value: values, expectedType: 'array' })
  config.typeChecker(
    { name: 'dividend', value: values[0], expectedType: 'number' },
    { name: 'divisor', value: values[1], expectedType: 'number' }
  )

  if (!values[1]) throw new Error('Division by zero!')

  switch (await evaluateExpression(expression.output)) {
    case 'quotient':
      return Math.floor(values[0] / values[1])
    case 'remainder':
      return values[0] % values[1]
    default:
      return values[0] / values[1]
  }
}

export const DIVIDE: OperatorObject = {
  requiredProperties,
  operatorAliases,
  propertyAliases,
  evaluate,
  parseChildren,
}
