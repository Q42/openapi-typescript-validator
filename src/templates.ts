export const decodersTemplate = `
/* eslint-disable */

import { ErrorObject } from 'ajv';
import * as types from './models'
import { $ValidatorImports } from './validators';

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
export const $DecoderName = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: any): $Class {
    return validateJson(json, $ValidatorName as Validator, $DecoderName.definitionName);
  }
}
`;

export const decodersMergedFileTemplate = `
/* eslint-disable */

import { validateJson, Validator } from './helpers';
import { $ModelImports } from './models';
import { $ValidatorImports } from './validators';

$Decoders
`;

export const decoderSingleFileTemplate = `
/* eslint-disable */

import { validateJson, Validator } from '../helpers';
import { $Class } from '../../models';
import { $ValidatorName } from './validator';

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

export const schemaMeta = {
  $Metas
}

export interface Meta<T> {
  definitionName: string;
}

function meta<T>(definitionName: string): Meta<T> {
  return {
    definitionName
  }
}
`;