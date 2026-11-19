import { TransformFnParams } from 'class-transformer';
export const queryBoolean = ({ value }: TransformFnParams): unknown =>
  value === 'true' ? true : value === 'false' ? false : value;
