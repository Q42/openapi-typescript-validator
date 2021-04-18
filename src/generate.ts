import * as path from "path";
import { compile } from "json-schema-to-typescript";
import keyby from "lodash.keyby";
import { modelsTemplate } from "./templates";
import { mkdirSync, writeFileSync } from "fs";
import { format } from "prettier";
import { parseSchema } from "./parse-schema";
import { GenerateOptions } from "./GenerateOptions";
import { generateMetaFile } from "./generate/generate-meta";
import {
  generateCompileDecoders,
  generateStandaloneDecoders,
  generateStandaloneMergedDecoders,
} from "./generate/generate-decoders";

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

  const compiledTypescriptModels = await compile(
    JSON.parse(schema.json),
    "Schema"
  );
  const rawTypescriptModels = modelsTemplate
    .replace(/\$Models/g, compiledTypescriptModels)
    .replace(/\s*\[k: string\]: unknown;/g, "") // Allow additional properties in schema but not in typescript
    .replace(/export interface Schema \{[^]*?\n\}/, "");

  const typescriptModels = format(rawTypescriptModels, prettierOptions);

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
      generateCompileDecoders(
        definitionNames,
        schema,
        name,
        directories,
        prettierOptions
      );
    } else if (options.mergeDecoders === true) {
      generateStandaloneMergedDecoders(
        definitionNames,
        schema,
        name,
        directories,
        prettierOptions
      );
    } else {
      generateStandaloneDecoders(
        definitionNames,
        schema,
        name,
        directories,
        prettierOptions
      );
    }
  }

  if (options.skipMetaFile !== true) {
    generateMetaFile(allDefinitions, name, directories, prettierOptions);
  }

  directories.forEach((directory) => {
    mkdirSync(directory, { recursive: true });

    writeFileSync(path.join(directory, `models.ts`), typescriptModels);

    if (options.skipSchemaFile !== true) {
      writeFileSync(path.join(directory, `schema.json`), schema.json);
    }
  });

  console.info(`Successfully generated files for ${schemaFile}`);
}
