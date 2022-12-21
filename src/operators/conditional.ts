import { evaluatorFunction } from '../evaluate'
import {
  BaseOperatorNode,
  EvaluatorNode,
  CombinedOperatorNode,
  EvaluatorOutput,
  FigTreeConfig,
  OperatorObject,
} from '../types'

const requiredProperties = ['condition', 'valueIfTrue', 'valueIfFalse'] as const
const operatorAliases = ['?', 'conditional', 'ifThen']
const propertyAliases = { ifTrue: 'valueIfTrue', ifFalse: 'valueIfFalse', ifNot: 'valueIfFalse' }

export type ConditionalNode = {
  [key in typeof requiredProperties[number]]: EvaluatorNode
} & BaseOperatorNode

const evaluate = async (
  expression: ConditionalNode,
  config: FigTreeConfig
): Promise<EvaluatorOutput> => {
  const condition = await evaluatorFunction(expression.condition, config)

  // Only evaluate the valueIfTrue/valueIfFalse branches if required to avoid
  // unnecessary computation
  return !!condition
    ? await evaluatorFunction(expression.valueIfTrue, config)
    : await evaluatorFunction(expression.valueIfFalse, config)
}

const parseChildren = (expression: CombinedOperatorNode): ConditionalNode => {
  const [condition, valueIfTrue, valueIfFalse] = expression.children as EvaluatorNode[]
  return { ...expression, condition, valueIfTrue, valueIfFalse }
}

export const CONDITIONAL: OperatorObject = {
  requiredProperties,
  operatorAliases,
  propertyAliases,
  evaluate,
  parseChildren,
}
