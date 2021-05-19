import { format, Options } from "prettier";
import { ParsedSchema } from "../parse-schema";
import Ajv from "ajv";
import addFormats, { FormatsPluginOptions } from "ajv-formats";
import standaloneCode from "ajv/dist/standalone";
import { mkdirSync, writeFileSync } from "fs";
import * as path from "path";
import { ValidatorOutput } from "../GenerateOptions";
import { createDecoderName, createValidatorName } from "./generation-utils";

export function generateStandaloneDecoders(
  definitionNames: string[],
  schema: ParsedSchema,
  addFormats: boolean,
  formatOptions: FormatsPluginOptions | undefined,
  output: ValidatorOutput,
  outDirs: string[],
  prettierOptions: Options
): void {
  if (definitionNames.length === 0) return;

  const indexExports: string[] = [];

  definitionNames.forEach((definitionName) => {
    const validatorName = createValidatorName(definitionName);
    const decoderName = createDecoderName(definitionName);

    const validatorsOutput = standAloneValidatorOutput(
      schema,
      [definitionName],
      addFormats,
      formatOptions,
      output,
      prettierOptions
    );

    const validatorImportStatement =
      output === "module"
        ? `import { ${validatorName} } from './validator'`
        : `const { ${validatorName} } = require("./validator")`;

    let rawDecoderOutput = decoderFileTemplate
      .replace(/\$DecoderName/g, decoderName)
      .replace(/\$Class/g, definitionName)
      .replace(/\$ValidatorImports/g, validatorImportStatement)
      .replace(/\$ValidatorName/g, validatorName);

    const decoderOutput = format(rawDecoderOutput, prettierOptions);

    const validatorDefinitions = validatorDefinitionsOutput(
      [definitionName],
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

      if (output === "module") {
        writeFileSync(
          path.join(decoderDir, `validator.d.ts`),
          validatorDefinitions
        );
      }
    });
  });

  const indexOutputRaw = decodersFileTemplate.replace(
    /\$Exports/gm,
    indexExports.join("\n")
  );

  const indexOutput = format(indexOutputRaw, prettierOptions);

  outDirs.forEach((outDir) => {
    const decoderDir = path.join(outDir, "decoders");
    mkdirSync(decoderDir, { recursive: true });

    writeFileSync(path.join(decoderDir, `index.ts`), indexOutput);
  });
}

export function generateStandaloneMergedDecoders(
  definitionNames: string[],
  schema: ParsedSchema,
  addFormats: boolean,
  formatOptions: FormatsPluginOptions | undefined,
  output: ValidatorOutput,
  outDirs: string[],
  prettierOptions: Options
) {
  if (definitionNames.length === 0) return;

  const decoders = definitionNames
    .map((definitionName) =>
      decoderTemplate
        .replace(/\$DecoderName/g, createDecoderName(definitionName))
        .replace(/\$Class/g, definitionName)
        .replace(/\$ValidatorName/g, createValidatorName(definitionName))
        .trim()
    )
    .join("\n");

  const validatorImports = definitionNames
    .map((d) => createValidatorName(d))
    .join(", ");

  const validatorImportStatement =
    output === "module"
      ? `import { ${validatorImports} } from './validators';`
      : `const { ${validatorImports} } = require("./validators")`;

  const rawDecoderOutput = mergedDecodersFileTemplate
    .replace(/\$ValidatorImports/g, validatorImportStatement)
    .replace(/\$ModelImports/g, definitionNames.join(", "))
    .replace(/\$Decoders/g, decoders);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  const rawValidatorsOutput = validatorsFileTemplate.replace(
    /\$Validators/g,
    standAloneValidatorOutput(
      schema,
      definitionNames,
      addFormats,
      formatOptions,
      output,
      prettierOptions
    )
  );

  const validatorsOutput = format(rawValidatorsOutput, prettierOptions);
  const validatorDefinitions = validatorDefinitionsOutput(
    definitionNames,
    prettierOptions
  );

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });

    writeFileSync(path.join(outDir, `decoders.ts`), decoderOutput);
    writeFileSync(path.join(outDir, `validators.js`), validatorsOutput);

    if (output === "module") {
      writeFileSync(path.join(outDir, `validators.d.ts`), validatorDefinitions);
    }
  });
}

function standAloneValidatorOutput(
  schema: ParsedSchema,
  definitions: string[],
  formats: boolean,
  formatOptions: FormatsPluginOptions | undefined,
  output: ValidatorOutput,
  prettierOptions: Options
): string {
  const ajv = new Ajv({ code: { source: true }, strict: false });
  if (formats) {
    addFormats(ajv, formatOptions);
  }
  ajv.compile(JSON.parse(schema.json));

  const refs = definitions.reduce<Record<string, string>>(
    (acc, definitionName) => {
      acc[
        createValidatorName(definitionName)
      ] = `#/definitions/${definitionName}`;
      return acc;
    },
    {}
  );

  let jsOutput = standaloneCode(ajv, refs);

  if (output === "module") {
    jsOutput = jsOutput.replace(
      /exports\.(\w+Validator) = (\w+)/gm,
      "export const $1 = $2"
    );
  }

  const rawValidatorsOutput = validatorsFileTemplate.replace(
    /\$Validators/g,
    jsOutput
  );

  const validatorsOutput = format(rawValidatorsOutput, prettierOptions);
  return validatorsOutput;
}

function validatorDefinitionsOutput(
  definitions: string[],
  prettierOptions: Options
) {
  const raw = definitions
    .map(
      (d) =>
        `export function ${createValidatorName(d)}(json: unknown): boolean;`
    )
    .join("\n");

  return format(raw, prettierOptions);
}

const validatorsFileTemplate = `
/* eslint-disable */

$Validators
`;

const decoderTemplate = `
export const $DecoderName: Decoder<$Class> = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: unknown): $Class {
    return validateJson(json, $ValidatorName as Validator, $DecoderName.definitionName);
  }
}
`;

const decoderFileTemplate = `
/* eslint-disable */

import { validateJson, Validator, Decoder } from '../../helpers';
import { $Class } from '../../models';
$ValidatorImports

${decoderTemplate}
`;

const decodersFileTemplate = `
/* eslint-disable */

$Exports
`;

const mergedDecodersFileTemplate = `
/* eslint-disable */

import { validateJson, Validator, Decoder } from './helpers';
import { $ModelImports } from './models';
$ValidatorImports

$Decoders
`;
