import { getRequiredProperties, getPropertyAliases } from '../_operatorUtils'
import { OperatorData, Parameter } from '../../types'

const description = 'Count elements in an array'
const aliases = ['count', 'length']
const parameters: Parameter[] = [
  {
    name: 'values',
    description: 'An array to count',
    aliases: [],
    required: true,
    type: 'array',
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
