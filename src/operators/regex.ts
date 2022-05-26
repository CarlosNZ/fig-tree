import { evaluateArray } from './_helpers'
import {
  BaseOperatorNode,
  EvaluatorNode,
  CombinedOperatorNode,
  ValueNode,
  EvaluatorConfig,
  OperatorObject,
} from '../types'

const requiredProperties = ['testString', 'pattern'] as const
const operatorAliases = ['regex', 'patternMatch', 'regexp', 'matchPattern']
const propertyAliases = {
  string: 'testString',
  value: 'testString',
  regex: 'pattern',
  regexp: 'pattern',
  regExp: 'pattern',
  re: 'pattern',
}

export type RegexNode = {
  [key in typeof requiredProperties[number]]: EvaluatorNode
} & BaseOperatorNode

const evaluate = async (expression: RegexNode, config: EvaluatorConfig): Promise<ValueNode> => {
  const [testString, pattern] = (await evaluateArray(
    [expression.testString, expression.pattern],
    config
  )) as [string, string]

  try {
    if (typeof pattern !== 'string') throw new Error('Invalid Regex pattern')
    const re: RegExp = new RegExp(pattern)
    return re.test(testString)
  } catch (err) {
    throw new Error('Regex error:' + err.message)
  }
}

const parseChildren = (expression: CombinedOperatorNode): RegexNode => {
  const [testString, pattern] = expression.children as EvaluatorNode[]
  return { ...expression, testString, pattern }
}

export const REGEX: OperatorObject = {
  requiredProperties,
  operatorAliases,
  propertyAliases,
  evaluate,
  parseChildren,
}
