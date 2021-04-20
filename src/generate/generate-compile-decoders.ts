import { format, Options } from "prettier";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { createDecoderName } from "./generation-utils";

export function generateCompileBasedDecoders(
  definitionNames: string[],
  addFormats: boolean,
  outDirs: string[],
  prettierOptions: Options
): void {
  const decoders = definitionNames
    .map((definitionName) =>
      decoderTemplate
        .replace(/\$DecoderName/g, createDecoderName(definitionName))
        .replace(/\$Class/g, definitionName)
        .trim()
    )
    .join("\n");

  const rawDecoderOutput = decodersFileTemplate
    .replace(/\$Imports/g, addFormats ? 'import addFormats from "ajv-formats"' : '')
    .replace(/\$Formats/g, addFormats ? 'addFormats(ajv);': '')
    .replace(/\$ModelImports/g, definitionNames.join(", "))
    .replace(/\$Decoders/g, decoders);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });

    writeFileSync(path.join(outDir, `decoders.ts`), decoderOutput);
  });
}

const decodersFileTemplate = `
/* eslint-disable */

import Ajv from 'ajv';
$Imports
import { validateJson, Decoder } from './helpers';
import { $ModelImports } from './models';
import jsonSchema from './schema.json';

const ajv = new Ajv({ strict: false });
ajv.compile(jsonSchema);
$Formats

// Decoders
$Decoders
`;

const decoderTemplate = `
export const $DecoderName: Decoder<$Class> = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: unknown): $Class {
    const schema = ajv.getSchema($DecoderName.schemaRef);
    if (!schema) {
      throw new Error(\`Schema \${$DecoderName.definitionName} not found\`);
    }
    return validateJson(json, schema, $DecoderName.definitionName);
  }
}
`;
