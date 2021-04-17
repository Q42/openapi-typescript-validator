import Ajv from "ajv";
import * as path from "path";
import { compile } from "json-schema-to-typescript";
import keyby from "lodash.keyby";
import {
  decoderTemplate,
  modelsTemplate,
  validatorsTemplate,
  validationHelperTemplate,
  decodersIndexTemplate,
} from "./templates";
import { mkdirSync, writeFileSync } from "fs";
import { format, Options } from "prettier";
import { ParsedSchema, parseSchema } from "./parse-schema";
import standaloneCode from "ajv/dist/standalone";
import { GenerateOptions } from "./GenerateOptions";

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

  // const validators = generateValidators(schema, dir);

  // const decoders = Object.entries(schema.definitions)
  //   .filter(([name, definition]) => definition.type === "object")
  //   .map(([definitionName]) =>
  //     decoderTemplate
  //       .replace(/\$DecoderName/g, `${definitionName}Decoder`)
  //       .replace(/\$Class/g, definitionName)
  //       .replace(/\$ValidatorName/g, `${definitionName}Validator`)
  //       .trim()
  //   )
  //   .join("\n");

  // const rawDecoderOutput = decodersTemplate
  //   .replace(/\$SchemaName/g, name)
  //   .replace(/\$ValidatorImports/g, validators.validatorNames.join(", "))
  //   .replace(/\$Decoders/g, decoders);

  // const decoderOutput = format(rawDecoderOutput, prettierOptions);

  // const rawValidatorsOutput = validatorsTemplate.replace(
  //   /\$Validators/g,
  //   validators.fileContent
  // );

  // const validatorsOutput = rawValidatorsOutput; //format(rawValidatorsOutput, prettierOptions);

  // const rawValidatorDefinitionsOutput = validators.validatorNames
  //   .map((name) => `export function ${name}(json: unknown): boolean;`)
  //   .join("\n");

  // const validatorDefinitionsOutput = format(
  //   rawValidatorDefinitionsOutput,
  //   prettierOptions
  // );

  const allDefinitions = Object.keys(schema.definitions);

  const whistlistedDecoders = options.decoders ?? schema.whitelistedDecoders;
  const decoderWhitelistById = whistlistedDecoders
    ? keyby(whistlistedDecoders, (d) => d)
    : undefined;

  const definitionNames = allDefinitions.filter((name) => {
    if (schema.definitions[name]?.type !== "object") return false;
    return !decoderWhitelistById || decoderWhitelistById[name];
  });

  generateValidators(
    definitionNames,
    schema,
    name,
    directories,
    prettierOptions
  );

  directories.forEach((directory) => {
    mkdirSync(directory, { recursive: true });

    writeFileSync(path.join(directory, `${name}-models.ts`), typescriptModels);
    // writeFileSync(path.join(directory, `${name}-decoders.ts`), decoderOutput);
    writeFileSync(path.join(directory, `${name}-schema.json`), schema.json);
    // writeFileSync(
    //   path.join(directory, `${name}-validators.js`),
    //   validatorsOutput
    // );
    // writeFileSync(
    //   path.join(directory, `${name}-validators.d.ts`),
    //   validatorDefinitionsOutput
    // );
  });

  console.info(`Successfully generated files for ${schemaFile}`);
}

interface ParsedValidators {
  fileContent: string;
  validatorNames: string[];
}

function generateValidators(
  definitionNames: string[],
  schema: ParsedSchema,
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
): void {
  const ajv = new Ajv({ code: { source: true }, strict: false });
  ajv.compile(JSON.parse(schema.json));

  const indexExports: string[] = [];

  definitionNames.forEach((definitionName) => {
    const validatorName = `${definitionName}Validator`;
    const decoderName = `${definitionName}Decoder`;

    const jsOutput = standaloneCode(ajv, {
      [validatorName]: `#/definitions/${definitionName}`,
    }).replace(/exports\.(\w+Validator) = (\w+)/gm, "export const $1 = $2");

    const rawValidatorsOutput = validatorsTemplate.replace(
      /\$Validators/g,
      jsOutput
    );

    const validatorsOutput = format(rawValidatorsOutput, prettierOptions);

    const rawDecoderOutput = decoderTemplate
      .replace(/\$DecoderName/g, decoderName)
      .replace(/\$Class/g, definitionName)
      .replace(/\$ValidatorName/g, validatorName)
      .replace(/\$PackageName/g, packageName)
      .trim();

    const decoderOutput = format(rawDecoderOutput, prettierOptions);

    const rawValidatorDefinitionsOutput = `export function ${validatorName}(json: unknown): boolean;`;

    const validatorDefinitionsOutput = format(
      rawValidatorDefinitionsOutput,
      prettierOptions
    );

    indexExports.push(
      `export { ${decoderName} } from './${definitionName}/decoder';`
    );

    outDirs.forEach((outDir) => {
      const decoderDir = path.join(outDir, "decoders", definitionName);
      mkdirSync(decoderDir, { recursive: true });

      writeFileSync(path.join(decoderDir, `decoder.ts`), decoderOutput);
      writeFileSync(path.join(decoderDir, `validator.js`), validatorsOutput);
      writeFileSync(
        path.join(decoderDir, `validator.d.ts`),
        validatorDefinitionsOutput
      );
    });
  });

  const helperOutput = format(validationHelperTemplate, prettierOptions);

  const indexOutputRaw = decodersIndexTemplate.replace(
    /\$Exports/gm,
    indexExports.join("\n")
  );

  const indexOutput = format(indexOutputRaw, prettierOptions);

  outDirs.forEach((outDir) => {
    const decoderDir = path.join(outDir, "decoders");
    mkdirSync(decoderDir, { recursive: true });

    writeFileSync(path.join(decoderDir, `helpers.ts`), helperOutput);
    writeFileSync(path.join(decoderDir, `index.ts`), indexOutput);
  });

  // const jsOutput = standaloneCode(ajv, validatorConfig);

  // const fileContent = jsOutput.replace(
  //   /exports\.(\w+Validator) = (\w+)/gm,
  //   "export const $1 = $2"
  // );

  // return {
  //   validatorNames,
  //   fileContent,
  // };
}
