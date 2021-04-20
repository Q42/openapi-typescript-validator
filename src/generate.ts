import keyby from "lodash.keyby";
import { parseSchema } from "./parse-schema";
import { GenerateOptions } from "./GenerateOptions";
import { generateMetaFile } from "./generate/generate-meta";
import { generateCompileBasedDecoders } from './generate/generate-compile-decoders';
import { generateStandaloneDecoders, generateStandaloneMergedDecoders } from './generate/generate-standalone-decoders';
import { generateHelpers } from './generate/generate-helpers';
import { generateModels } from './generate/generate-models';

export async function generate(options: GenerateOptions) {
  const { name, schemaFile, schemaType } = options;
  const prettierOptions = options.prettierOptions ?? { parser: "typescript" };

  const directories: string[] =
    typeof options.directory === "string"
      ? [options.directory]
      : options.directory;

  console.info(
    `Start generating files for ${schemaType} schema: ${schemaFile}`
  );

  const schema = await parseSchema(schemaFile, schemaType);

  const allDefinitions = Object.keys(schema.definitions);

  const whistlistedDecoders = options.decoders ?? schema.whitelistedDecoders;
  const decoderWhitelistById = whistlistedDecoders
    ? keyby(whistlistedDecoders, (d) => d)
    : undefined;

  const definitionNames = allDefinitions.filter((name) => {
    if (schema.definitions[name]?.type !== "object") return false;
    return !decoderWhitelistById || decoderWhitelistById[name];
  });

  if (options.skipDecoders !== true) {
    if (!options.standalone) {
      generateCompileBasedDecoders(
        definitionNames,
        options.addFormats ?? false,
        options.formatOptions,
        directories,
        prettierOptions
      );
    } else if (options.standalone.mergeDecoders === true) {
      generateStandaloneMergedDecoders(
        definitionNames,
        schema,
        options.standalone.validatorOutput,
        directories,
        prettierOptions
      );
    } else {
      generateStandaloneDecoders(
        definitionNames,
        schema,
        options.standalone.validatorOutput,
        directories,
        prettierOptions
      );
    }
  }

  await generateModels(schema, { skipSchemaFile: options.skipSchemaFile }, prettierOptions, directories);
  generateHelpers(prettierOptions, directories);

  if (options.skipMetaFile !== true) {
    generateMetaFile(allDefinitions, name, directories, prettierOptions);
  }

  console.info(`Successfully generated files for ${schemaFile}`);
}
