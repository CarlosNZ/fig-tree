/*
Core FigTreeEvaluator class
*/

import {
  EvaluatorNode,
  FigTreeOptions,
  GenericObject,
  OperatorAliases,
  OperatorMetadata,
  OperatorReference,
  FragmentMetadata,
} from './types'
import { evaluatorFunction } from './evaluate'
import { typeCheck, TypeCheckInput } from './typeCheck'
import opAliases from './operators/_operatorAliases.json'
import * as operators from './operators'
import { filterOperators, mergeOptions } from './helpers'
import FigTreeCache from './cache'

const pkg = require('../package.json')

const operatorAliases = opAliases as OperatorAliases // Set type for JSON object

class FigTreeEvaluator {
  private options: FigTreeOptions
  private operators: OperatorReference
  private operatorAliases: OperatorAliases
  private cache: FigTreeCache
  constructor(options: FigTreeOptions = {}) {
    this.options = standardiseOptionNames(options)
    this.operators = filterOperators(
      operators,
      this.options?.excludeOperators ?? [],
      operatorAliases
    )
    this.operatorAliases = operatorAliases
    this.cache = new FigTreeCache(options.maxCacheSize)
  }

  private typeChecker = (...args: TypeCheckInput[] | [TypeCheckInput[]]) => {
    // Can accept args as either an array, or multiple parameters
    const inputArgs =
      args.length === 1 && Array.isArray(args[0]) ? args[0] : (args as TypeCheckInput[])
    const result = typeCheck(...inputArgs)
    if (result === true) return
    throw new Error(result)
  }

  public async evaluate(expression: EvaluatorNode, options: FigTreeOptions = {}) {
    // Update options from current call if specified
    const currentOptions = mergeOptions(this.options, standardiseOptionNames(options))

    // Update cache max size
    if (currentOptions.maxCacheSize && currentOptions.maxCacheSize !== this.cache.getMax())
      this.cache.setMax(currentOptions.maxCacheSize)

    return await evaluatorFunction(expression, {
      options: currentOptions,
      operators: options.excludeOperators
        ? filterOperators(operators, options.excludeOperators, operatorAliases)
        : this.operators,
      operatorAliases: this.operatorAliases,
      typeChecker: currentOptions.skipRuntimeTypeCheck ? () => {} : this.typeChecker,
      resolvedAliasNodes: {},
      cache: this.cache,
    })
  }

  public getOptions() {
    return this.options
  }

  public updateOptions(options: FigTreeOptions) {
    this.options = mergeOptions(this.options, standardiseOptionNames(options))
    if (this.options.excludeOperators)
      this.operators = filterOperators(operators, this.options.excludeOperators, operatorAliases)
  }

  public getOperators() {
    const validOperators = this.options.excludeOperators
      ? filterOperators(operators, this.options.excludeOperators, operatorAliases)
      : this.operators
    return Object.entries(validOperators).map(([key, value]) => ({
      operator: key,
      ...value.operatorData,
    })) as readonly OperatorMetadata[]
  }

  public getFragments() {
    return Object.entries(this.options.fragments ?? {}).map(([key, value]) => ({
      name: key,
      ...value?.metadata,
    })) as readonly (FragmentMetadata & { name: string })[]
  }

  public getCustomFunctions() {
    return Object.entries(this.options.functions ?? {}).map(([name, value]) => ({
      name,
      numRequiredArgs: value.length,
    })) as readonly { name: string; numRequiredArgs: number }[]
  }

  public getVersion = () => pkg.version
}

export default FigTreeEvaluator

// Stand-alone function for evaluating expressions without creating a
// FigTreeEvaluator object instance
export const evaluateExpression = (expression: EvaluatorNode, options?: FigTreeOptions) =>
  new FigTreeEvaluator(options).evaluate(expression)

// Some option names may change over time, or we allow aliases. This function
// ensures backwards compatibility and keeps option names standardised.
const standardiseOptionNames = (options: FigTreeOptions & { objects?: GenericObject }) => {
  if ('objects' in options) {
    options.data = options.objects
    delete options.objects
  }
  return options
}
