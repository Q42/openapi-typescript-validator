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

  /**
   * Merge decoders into a single file
   * This will reduce the build size, but might increase the time it takes to treeshake the bundle
   */
  mergeDecoders?: boolean;

  /**
   * don't output the meta file
   */
  skipMetaFile?: boolean;

  /**
   * don't output the schema file
   */
  skipSchemaFile?: boolean;

  /**
   * don't output decoder files
   */
  skipDecoders?: boolean;
}
