import extractProperty from 'object-property-extractor/build/extract'
import { evaluatorFunction } from '../evaluate'
import {
  GenericObject,
  EvaluatorNode,
  EvaluatorOutput,
  EvaluatorConfig,
  EvaluatorOptions,
} from '../types'

// Evaluate all child/property nodes simultaneously
export const evaluateArray = async (
  nodes: EvaluatorNode[],
  params: EvaluatorConfig
): Promise<EvaluatorOutput[]> => {
  return await Promise.all(nodes.map((node) => evaluatorFunction(node, params)))
}
/*
"Zips" two arrays into an object, where the first array provides 
the keys, and the second becomes the values
e.g. (["one", "two"], [1, 2]) => {one: 1, two: 2}
*/
export const zipArraysToObject = <T>(
  keys: string[],
  values: T[]
): { [K in typeof keys[number]]: T } => {
  const pairs = keys.map((key, index) => [key, values[index]])
  return Object.fromEntries(pairs)
}

/*
If object only has one property, just return the value of that property
rather than the whole object
*/
export const simplifyObject = (item: number | string | boolean | GenericObject) => {
  return item instanceof Object && Object.keys(item).length === 1 ? Object.values(item)[0] : item
}

/*
Extracts a (nested) property from Object and simplifies output as above
*/
export const extractAndSimplify = (
  data: GenericObject | GenericObject[],
  returnProperty: string | undefined,
  fallback: any = undefined
) => {
  try {
    const selectedProperty = returnProperty ? extractProperty(data, returnProperty, fallback) : data
    if (Array.isArray(selectedProperty)) return selectedProperty.map((item) => simplifyObject(item))
    if (returnProperty) {
      if (selectedProperty === null) return null // GraphQL field can return null as valid result
      return simplifyObject(selectedProperty)
    }
    return selectedProperty
  } catch (err) {
    throw err
  }
}

interface APIrequestProps {
  url: string
  APIfetch: any
  method?: 'GET' | 'POST'
  body?: { [key: string]: string } | null
  headers?: { [key: string]: string }
}

export const processAPIquery = async (
  {
    url,
    parameters = {},
    returnProperty,
  }: { url: string; parameters: GenericObject; returnProperty?: string },
  options: EvaluatorOptions,
  headers: GenericObject,
  isPostRequest = false
) => {
  const APIfetch = options.APIfetch
  const urlWithQuery =
    Object.keys(parameters).length > 0 && !isPostRequest
      ? `${url}?${Object.entries(parameters)
          .map(([key, val]) => key + '=' + val)
          .join('&')}`
      : url
  const requestBody = isPostRequest ? parameters : null

  let data

  data = isPostRequest
    ? await fetchAPIrequest({
        url,
        APIfetch,
        method: 'POST',
        body: requestBody,
        headers,
      })
    : await fetchAPIrequest({ url: urlWithQuery, APIfetch, headers })
  return extractAndSimplify(data, returnProperty)
}

// GET/POST request using fetch (node or browser variety)
export const fetchAPIrequest = async ({
  url,
  APIfetch,
  method = 'GET',
  body,
  headers = {},
}: APIrequestProps) => {
  const response = await APIfetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
  if (response.ok) return await response.json()
  else throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
}
