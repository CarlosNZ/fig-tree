import { parse } from './logicalAnd'
import { OperationInput } from '../operatorReference'

const operate = ({ children }: OperationInput): boolean =>
  children.reduce((acc: boolean, child: boolean) => acc || child, false)

export const logicalOr = { parse, operate }
