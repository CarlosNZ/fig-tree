import { EvaluatorNode, EvaluatorOptions, Operator } from './types'
import { evaluatorFunction } from './evaluate'
import operatorAliases from './operators/_operatorAliases.json'
import * as operators from './operators'

class ExpressionEvaluator {
  options: EvaluatorOptions
  operators: any // FIX ANY
  operatorAliases: { [key: string]: Operator }
  constructor(options: EvaluatorOptions = {}) {
    this.options = options
    this.operators = operators
    this.operatorAliases = operatorAliases as { [key: string]: Operator }
  }

  public async evaluate(expression: EvaluatorNode, options: EvaluatorOptions = {}) {
    // Update options from current instance if specified
    return await evaluatorFunction(expression, {
      options: { ...this.options, ...options },
      operators: this.operators,
      operatorAliases: this.operatorAliases,
    })
  }

  public updateOptions(options: EvaluatorOptions) {
    this.options = { ...this.options, ...options }
  }
}

export default ExpressionEvaluator

export const evaluateExpression = (expression: EvaluatorNode, options?: EvaluatorOptions) =>
  new ExpressionEvaluator(options).evaluate(expression)
