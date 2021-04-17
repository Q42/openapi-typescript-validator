export const decodersTemplate = `
/* eslint-disable */

import { ErrorObject } from 'ajv';
import * as types from './$SchemaName-models'
import { $ValidatorImports } from './$SchemaName-validators';

interface Validator {
  (json: unknown): boolean;
  errors?: ErrorObject[]
}

function validateJson(json: any, validator: Validator, definitionName: string): any {
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

// Decoders
$Decoders
`;

export const validationHelperTemplate = `
/* eslint-disable */
import type { ErrorObject } from 'ajv';

export interface Validator {
  (json: unknown): boolean;
  errors?: ErrorObject[]
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
/* eslint-disable */

import { validateJson, Validator } from '../helpers';
import { $Class } from '../../$PackageName-models';
import { $ValidatorName } from './validator';

export const $DecoderName = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: any): $Class {
    return validateJson(json, $ValidatorName as Validator, $DecoderName.definitionName);
  }
}
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
