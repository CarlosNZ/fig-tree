import { getRequiredProperties, getPropertyAliases } from '../_operatorUtils'
import { OperatorData, Parameter } from '../../types'

const description = 'HTTP POST Request'
const aliases = ['post']
const parameters: Parameter[] = [
  {
    name: 'url',
    description: 'Endpoint URL',
    aliases: ['endpoint'],
    required: true,
    type: 'string',
  },
  {
    name: 'returnProperty',
    description: 'Property path from request result',
    aliases: ['outputProperty'],
    required: false,
    type: 'string',
  },
  {
    name: 'headers',
    description: 'HTTP Headers',
    aliases: [],
    required: false,
    type: 'object',
  },
  {
    name: 'data',
    description: 'JSON Body parameters (key-value)',
    aliases: [],
    required: false,
    type: 'object',
  },
  {
    name: 'useCache',
    description: 'Whether or not the FigTree cache is used',
    aliases: [],
    required: false,
    type: 'boolean',
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
