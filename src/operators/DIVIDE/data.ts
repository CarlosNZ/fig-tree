import { getRequiredProperties, getPropertyAliases } from '../_operatorUtils'
import { OperatorData, Parameter } from '../../types'

const description = 'Divide one numerical value by another'
const aliases = ['/', 'divide', '÷']
const parameters: Parameter[] = [
  {
    name: 'values',
    description: 'Array of values - 1st element will be divided by the first',
    aliases: [],
    required: false,
    type: 'array',
  },
  {
    name: 'dividend',
    description: 'The number that will be divided',
    aliases: ['divide'],
    required: false,
    type: 'number',
  },
  {
    name: 'divisor',
    description: 'The number that dividend will be divided by',
    aliases: ['by', 'divideBy'],
    required: false,
    type: 'number',
  },
  {
    name: 'output',
    description: 'Whether to output a quotient, remainder or decimal',
    aliases: [],
    required: false,
    type: { literal: ['quotient', 'remainder'] },
  },
]

export const requiredProperties = getRequiredProperties(parameters)
export const propertyAliases = getPropertyAliases(parameters)

const operatorData: OperatorData = {
  description,
  aliases,
  parameters,
}

export default operatorData
