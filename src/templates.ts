export const ajvCompileDecodersTemplate = `
/* eslint-disable */

import Ajv from 'ajv';

import { validateJson, Decoder } from './helpers';
import { $ModelImports } from './models';
import jsonSchema from './schema.json';

const ajv = new Ajv({ strict: false });
ajv.compile(jsonSchema);

// Decoders
$Decoders
`;


export const ajvCompileDecoderTemplate = `
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


export const validationHelperTemplate = `
/* eslint-disable */
import type { ErrorObject } from 'ajv';

export interface Decoder<T> {
  definitionName: string;
  schemaRef: string;
  decode: (json: unknown) => T;
}

export interface Validator {
  (json: unknown): boolean;
  errors?: ErrorObject[] | null;
}

export function validateJson(json: any, validator: Validator, definitionName: string): any {
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json;

  if (validator(jsonObject)) {
    return jsonObject;
  }

  const jsonPreviewStr = (typeof json === 'string' ? json : JSON.stringify(jsonObject)).substring(0, 200);
  if (validator.errors) {
    throw Error(\`\${definitionName} \${errorsText(validator.errors)}. JSON: \${jsonPreviewStr}\`);
  }

  throw Error(\`\${definitionName} Unexpected data received. JSON: \${jsonPreviewStr}\`);
}

function errorsText(errors: ErrorObject[]): string {
  return errors.map(error => \`\${error.instancePath}: \${error.message}\`).join('\\n')
}
`;

export const decoderTemplate = `
export const $DecoderName: Decoder<$Class> = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: unknown): $Class {
    return validateJson(json, $ValidatorName as Validator, $DecoderName.definitionName);
  }
}
`;

export const decodersMergedFileTemplate = `
/* eslint-disable */

import { validateJson, Validator, Decoder } from './helpers';
import { $ModelImports } from './models';
$ValidatorImports

$Decoders
`;

export const decoderSingleFileTemplate = `
/* eslint-disable */

import { validateJson, Validator, Decoder } from '../../helpers';
import { $Class } from '../../models';
$ValidatorImports

${decoderTemplate}
`;

export const decodersIndexTemplate = `
/* eslint-disable */

$Exports
`

export const modelsTemplate = `
/* eslint-disable */

$Models
`;

export const validatorsTemplate = `
/* eslint-disable */

$Validators
`;

export const metaTemplate = `
/* eslint-disable */
import { $ModelImports } from './models';

export const schemaDefinitions = {
  $Definitions
}

export interface SchemaInfo<T> {
  definitionName: string;
  schemaRef: string;
}

function info<T>(definitionName: string, schemaRef: string): SchemaInfo<T> {
  return { definitionName, schemaRef };
}
`;