import fetch from 'node-fetch'
import { Client } from 'pg'
import ExpressionEvaluator, { evaluateExpression } from '../evaluator'
import pgConfig from '../test/postgres/pgConfig.json'

const pgConnect = new Client(pgConfig)
pgConnect.connect()

const exp = new ExpressionEvaluator({
  APIfetch: fetch,
  pgConnection: pgConnect,
  graphQLConnection: {
    fetch: fetch,
    endpoint: 'https://countries.trevorblades.com/',
  },
  objects: {
    randomWords: ['starfield', 'spaceships', 'planetary', ['DEATH STAR']],
    organisation: 'Galactic Empire',
    longSentence: {
      '🇨🇺': "Rebel spies managed to steal secret plans to the Empire's ultimate weapon",
    },
    functions: { getPrincess: (name: string) => `Princess ${name}` },
    Oceania: { NZ: { Wellington: 'stolen plans that can save her people' } },
  },
  allowJSONStringInput: true,
})

test('Input is an array -- each item will be evaluated', () => {
  return exp
    .evaluate(
      [
        {
          operator: '+',
          values: [6, 7, 8],
        },
        {
          operator: 'objectProperties',
          property: 'name',
        },
        {
          operator: '!=',
          children: [6, 'tree'],
        },
      ],
      { objects: { name: 'Percy' } }
    )
    .then((result: any) => {
      expect(result).toStrictEqual([21, 'Percy', true])
    })
})

// Mother of all queries

const expression = {
  operator: '+',
  values: [
    {
      operator: 'stringSubstitution',
      children: [
        'It is a period of %1. Rebel %2, striking from a hidden base, have won their first victory against the evil %3.',
        {
          operator: '?',
          children: [
            {
              operator: '=',
              values: [
                {
                  operator: 'pg',
                  query: 'SELECT country FROM customers WHERE postal_code = $1',
                  values: [
                    {
                      operator: 'pgSQL',
                      children: ['(SELECT MAX(postal_code) from customers)'],
                      type: 'string',
                    },
                  ],
                  type: 'string',
                },
                'UK',
              ],
            },
            'civil war',
            'robot fury',
          ],
        },
        {
          operator: 'getProperty',
          property: {
            operator: 'substitute',
            children: [
              'randomWords[%99]',
              {
                operator: 'And',
                values: [
                  {
                    operator: 'REGEX',
                    pattern: 'A.+roa',
                    testString: {
                      operator: 'get',
                      url: 'https://restcountries.com/v3.1/alpha',
                      parameters: {
                        codes: 'nz,au',
                      },
                      returnProperty: '[1].name.nativeName.mri.official',
                    },
                  },
                  {
                    operator: 'ne',
                    values: [
                      {
                        operator: '+',
                        values: [6.66, 3.33],
                      },
                      10,
                    ],
                  },
                ],
                type: 'number',
              },
            ],
          },
        },
        {
          operator: 'objectProperties',
          children: ['organisation'],
        },
      ],
    },
    '\n\n',
    {
      operator: 'SUBSTITUTE',
      string:
        'During the battle, %1, the %2, an armored space station with enough power to destroy an entire planet.',
      substitutions: [
        {
          operator: 'objectProperties',
          property: {
            operator: '+',
            values: [
              'longSentence.',
              {
                operator: 'API',
                children: [
                  {
                    operator: '+',
                    children: ['https://restcountries.com/v3.1/name/', 'cuba'],
                  },
                  ['fullText', 'fields'],
                  true,
                  'name,capital,flag',
                  'flag',
                ],
                type: 'string',
              },
            ],
          },
        },
        {
          operator: 'objProps',
          property: 'randomWords[3]',
        },
      ],
    },
    '\n\n',
    {
      operator: 'string_substitution',
      string:
        "Pursued by the %2's sinister agents, %3 races home aboard her starship, custodian of the %1 and restore freedom to the galaxy....",
      substitutions: [
        {
          operator: 'objProps',
          property: {
            operator: 'substitute',
            string: 'Oceania.NZ.%1',
            substitutions: [
              {
                operator: 'gql',
                query:
                  'query capitals($code:String!) {countries(filter: {code: {eq: $code}}) {capital}}',
                variables: { operator: 'buildObject', properties: [{ key: 'code', value: 'NZ' }] },
                returnNode: 'countries',
              },
            ],
          },
        },
        {
          operator: 'objProps',
          property: 'cant.find.this',
          fallback: 'Empire',
        },
        { operator: 'functions', functionPath: 'functions.getPrincess', args: ['Leia'] },
      ],
    },
  ],
}

test('Massive nested query!', () => {
  return exp.evaluate(expression).then((result: any) => {
    expect(result).toBe(
      "It is a period of civil war. Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.\n\nDuring the battle, Rebel spies managed to steal secret plans to the Empire's ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.\n\nPursued by the Empire's sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy...."
    )
  })
})

const jsonExpression =
  '{"operator":"+","values":[{"operator":"stringSubstitution","children":["It is a period of %1. Rebel %2, striking from a hidden base, have won their first victory against the evil %3.",{"operator":"?","children":[{"operator":"=","values":[{"operator":"pg","query":"SELECT country FROM customers WHERE postal_code = $1","values":[{"operator":"pgSQL","children":["(SELECT MAX(postal_code) from customers)"],"type":"string"}],"type":"string"},"UK"]},"civil war","robot fury"]},{"operator":"getProperty","property":{"operator":"substitute","children":["randomWords[%99]",{"operator":"And","values":[{"operator":"REGEX","pattern":"A.+roa","testString":{"operator":"get","url":"https://restcountries.com/v3.1/alpha","parameters":{"codes":"nz,au"},"returnProperty":"[1].name.nativeName.mri.official"}},{"operator":"ne","values":[{"operator":"+","values":[6.66,3.33]},10]}],"type":"number"}]}},{"operator":"objectProperties","children":["organisation"]}]},"\\n\\n",{"operator":"SUBSTITUTE","string":"During the battle, %1, the %2, an armored space station with enough power to destroy an entire planet.","substitutions":[{"operator":"objectProperties","property":{"operator":"+","values":["longSentence.",{"operator":"API","children":[{"operator":"+","children":["https://restcountries.com/v3.1/name/","cuba"]},["fullText","fields"],true,"name,capital,flag","flag"],"type":"string"}]}},{"operator":"objProps","property":"randomWords[3]"}]},"\\n\\n",{"operator":"string_substitution","string":"Pursued by the %2\'s sinister agents, %3 races home aboard her starship, custodian of the %1 and restore freedom to the galaxy....","substitutions":[{"operator":"objProps","property":{"operator":"substitute","string":"Oceania.NZ.%1","substitutions":[{"operator":"gql","query":"query capitals($code:String!) {countries(filter: {code: {eq: $code}}) {capital}}","variables":{"operator":"buildObject","properties":[{"key":"code","value":"NZ"}]},"returnNode":"countries"}]}},{"operator":"objProps","property":"cant.find.this","fallback":"Empire"},{"operator":"functions","functionPath":"functions.getPrincess","args":["Leia"]}]}]}'

test('Massive nested query as JSON string', () => {
  return exp.evaluate(jsonExpression).then((result: any) => {
    expect(result).toBe(
      "It is a period of civil war. Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.\n\nDuring the battle, Rebel spies managed to steal secret plans to the Empire's ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.\n\nPursued by the Empire's sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy...."
    )
  })
})

// Close PG connection so script can exit
afterAll(() => {
  pgConnect.end()
})
