import { format, Options } from "prettier";
import { ParsedSchema } from "../parse-schema";
import Ajv from "ajv";
import {
  decodersIndexTemplate,
  decodersMergedFileTemplate,
  decoderTemplate,
  decoderSingleFileTemplate,
  validationHelperTemplate,
  validatorsTemplate,
  ajvCompileDecoderTemplate,
  ajvCompileDecodersTemplate,
} from "../templates";
import standaloneCode from "ajv/dist/standalone";
import { mkdirSync, writeFileSync } from "fs";
import * as path from "path";
import { ValidatorOutput } from '../GenerateOptions';

export function generateStandaloneDecoders(
  definitionNames: string[],
  schema: ParsedSchema,
  output: ValidatorOutput,
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
): void {
  const indexExports: string[] = [];

  definitionNames.forEach((definitionName) => {
    const validatorName = createValidatorName(definitionName);
    const decoderName = createDecoderName(definitionName);

    const validatorsOutput = standAloneValidatorOutput(
      schema,
      [definitionName],
      output,
      prettierOptions
    );

    const validatorImportStatement =
      output === "module"
        ? `import { ${validatorName} } from './validator'`
        : `const { ${validatorName} } = require("./validator")`;

    let rawDecoderOutput = decoderSingleFileTemplate
      .replace(/\$DecoderName/g, decoderName)
      .replace(/\$Class/g, definitionName)
      .replace(/\$ValidatorImports/g, validatorImportStatement)
      .replace(/\$ValidatorName/g, validatorName)
      .replace(/\$PackageName/g, packageName);

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

      if (output === 'module') {
        writeFileSync(
          path.join(decoderDir, `validator.d.ts`),
          validatorDefinitions
        );
      }
    });
  });

  const helpers = helpersOutput(prettierOptions);

  const indexOutputRaw = decodersIndexTemplate.replace(
    /\$Exports/gm,
    indexExports.join("\n")
  );

  const indexOutput = format(indexOutputRaw, prettierOptions);

  outDirs.forEach((outDir) => {
    const decoderDir = path.join(outDir, "decoders");
    mkdirSync(decoderDir, { recursive: true });

    writeFileSync(path.join(outDir, `helpers.ts`), helpers);
    writeFileSync(path.join(decoderDir, `index.ts`), indexOutput);
  });
}

export function generateStandaloneMergedDecoders(
  definitionNames: string[],
  schema: ParsedSchema,
  output: ValidatorOutput,
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
) {
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

  const rawDecoderOutput = decodersMergedFileTemplate
    .replace(/\$ValidatorImports/g, validatorImportStatement)
    .replace(/\$ModelImports/g, definitionNames.join(", "))
    .replace(/\$PackageName/g, packageName)
    .replace(/\$Decoders/g, decoders);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  const rawValidatorsOutput = validatorsTemplate.replace(
    /\$Validators/g,
    standAloneValidatorOutput(schema, definitionNames, output, prettierOptions)
  );

  const validatorsOutput = format(rawValidatorsOutput, prettierOptions);
  const validatorDefinitions = validatorDefinitionsOutput(
    definitionNames,
    prettierOptions
  );

  const helpers = helpersOutput(prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });

    writeFileSync(path.join(outDir, `helpers.ts`), helpers);
    writeFileSync(path.join(outDir, `decoders.ts`), decoderOutput);
    writeFileSync(path.join(outDir, `validators.js`), validatorsOutput);

    if (output === 'module') {
      writeFileSync(path.join(outDir, `validators.d.ts`), validatorDefinitions);
    }
  });
}

export function generateCompileDecoders(
  definitionNames: string[],
  schema: ParsedSchema,
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
): void {
  const decoders = definitionNames
    .map((definitionName) =>
      ajvCompileDecoderTemplate
        .replace(/\$DecoderName/g, createDecoderName(definitionName))
        .replace(/\$Class/g, definitionName)
        .trim()
    )
    .join("\n");

  const rawDecoderOutput = ajvCompileDecodersTemplate
    .replace(/\$ModelImports/g, definitionNames.join(", "))
    .replace(/\$PackageName/g, packageName)
    .replace(/\$Decoders/g, decoders);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  const helpers = helpersOutput(prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });

    writeFileSync(path.join(outDir, `helpers.ts`), helpers);
    writeFileSync(path.join(outDir, `decoders.ts`), decoderOutput);
  });
}

function createValidatorName(definitionName: string) {
  return `${definitionName}Validator`;
}

function createDecoderName(definitionName: string) {
  return `${definitionName}Decoder`;
}

function standAloneValidatorOutput(
  schema: ParsedSchema,
  definitions: string[],
  output: ValidatorOutput,
  prettierOptions: Options
): string {
  const ajv = new Ajv({ code: { source: true }, strict: false });
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

  const rawValidatorsOutput = validatorsTemplate.replace(
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

function helpersOutput(prettierOptions: Options) {
  return format(validationHelperTemplate, prettierOptions);
}
