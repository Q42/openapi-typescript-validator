export const decodersTemplate = `
/* eslint-disable */
/* tslint-disable */
import { ErrorObject } from 'ajv';
import * as types from './$SchemaName-models'
import { $ValidatorImports } from './$SchemaName-validators';


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! AUTO GENERATED CODE, DON'T TOUCH !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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

export const decoderTemplate = `
export const $DecoderName = {
  definitionName: '$Class',
  schemaRef: '#/definitions/$Class',

  decode(json: any): types.$Class {
    return validateJson(json, $ValidatorName as Validator, $DecoderName.definitionName);
  }
}
`;

export const modelsTemplate = `
/* eslint-disable */

$Models
`;

export const validatorsTemplate = `
/* eslint-disable */

$Validators
`;
