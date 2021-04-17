import { Options } from 'prettier';
import { SchemaType } from './parse-schema';

export interface GenerateOptions {
  /** file location of the schema */
  schemaFile: string;
  schemaType: SchemaType;
  /** prefix for the generated files */
  name: string;
  /** location(s) where the output files will be stored. */
  directory: string | string[];
  /**
   * @default prettier typescript options
   */
  prettierOptions?: Options;
  /**
   * list of definitions to generate decoders for
   * @default generates decoder for every element
   */
  decoders?: string[];
}
