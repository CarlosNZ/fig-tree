import { getPropertyAliases } from '../operatorUtils'
import { OperatorData, OperatorParameterMetadata } from '../../types'

const description = 'Subtract one numerical value from another'
const aliases = ['-', 'subtract', 'minus', 'takeaway']
const parameters: OperatorParameterMetadata[] = [
  {
    name: 'values',
    description: 'Array of values - 2nd element will be subtracted from the first',
    aliases: [],
    required: false,
    type: 'array',
    default: [10, 5],
  },
  {
    name: 'from',
    description: 'Numerical value that will be subtracted from',
    aliases: ['subtractFrom'],
    required: false,
    type: 'number',
    default: 100,
  },
  {
    name: 'subtract',
    description: 'Numerical value to subtract',
    aliases: [],
    required: false,
    type: 'number',
    default: 50,
  },
]

export const propertyAliases = getPropertyAliases(parameters)

const operatorData: OperatorData = {
  description,
  aliases,
  parameters,
}

export default operatorData
