import { Options } from "prettier";
import { SchemaType } from "./parse-schema";

export type ValidatorOutput = "module" | "commonjs";

export interface StandaloneOptions {
  /**
   * Merge decoders into a single file
   * This will reduce the build size, but might increase the time it takes to treeshake the bundle
   * Only works for standalone builds
   */
  mergeDecoders?: boolean;

  /**
   * JS format of the validators We can't generate TS yet. Ajv doesn't support it.
   */
  validatorOutput: ValidatorOutput;
}

export interface GenerateOptions {
  /** file location of the schema */
  schemaFile: string;

  schemaType: SchemaType;

  /** prefix for the generated files */
  name: string;

  /** location(s) where the output files will be stored. */
  directory: string | string[];

  /**
   * adds the "ajv-formats" packages
   * @default false
  */
  addFormats?: boolean;

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
   * Generates all validators up front.
   * Read more about it at the AJV 7 upgrade: https://openjsf.org/blog/2021/02/11/project-news-ajv-version-7-big-changes-and-improvements/
   * @default undefined
   */
  standalone?: StandaloneOptions;

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
