import { TransformFnParams } from 'class-transformer';
export const queryInteger = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
