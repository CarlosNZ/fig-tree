import { getPropertyAliases } from '../operatorUtils'
import { OperatorData, Parameter } from '../../types'

const description = 'Query a Postgres database using node-postgres'
const aliases = ['pgSql', 'sql', 'postgres', 'pg', 'pgDb']
const parameters: Parameter[] = [
  {
    name: 'query',
    description: 'A SQL query string, with parameterised replacements (e.g. $1, $2, etc)',
    aliases: [],
    required: true,
    type: 'string',
  },
  {
    name: 'values',
    description:
      'An array/object of values to replace in the SQL string parameters, as per SQL connection specifications ',
    aliases: ['replacements'],
    required: false,
    type: ['array', 'object'],
  },
  {
    name: 'single',
    description: 'Specify if returning a single record',
    aliases: ['queryType'],
    required: false,
    type: 'boolean',
  },
  {
    name: 'flatten',
    description:
      'Specify whether to flatten resulting object to an array of values (use in conjunction with "single")',
    aliases: ['flat'],
    required: false,
    type: 'boolean',
  },
  {
    name: 'useCache',
    description: 'Whether or not the FigTree cache is used',
    aliases: [],
    required: false,
    type: 'boolean',
  },
]

export const propertyAliases = getPropertyAliases(parameters)

const operatorData: OperatorData = {
  description,
  aliases,
  parameters,
}

export default operatorData
