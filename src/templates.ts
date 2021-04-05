export const decodersTemplate = `
/* eslint-disable */
/* tslint-disable */
import Ajv, { ErrorObject } from 'ajv';
import schema from './$SchemaName-schema.json';
import * as types from './$SchemaName-models'
import addFormats from "ajv-formats";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! AUTO GENERATED CODE, DON'T TOUCH !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const ajv = new Ajv({ strict: false });

// Adds more formats like date-time, int32, and int64.
addFormats(ajv);

ajv.addSchema(schema);

function validateJson(json: any, schemaRef: string, definitionName: string): any {
  const schema = ajv.getSchema(schemaRef);
  if (!schema) {
    throw new Error(\`Schema \${schemaRef} not found\`);
  }

  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json;

  if (schema(jsonObject)) {
    return jsonObject;
  }

  const jsonPreviewStr = (typeof json === 'string' ? json : JSON.stringify(jsonObject)).substring(0, 200);
  if (schema.errors) {
    throw Error(\`\${definitionName} \${errorsText(schema.errors)}. JSON-preview: \${jsonPreviewStr}\`);
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
export class $DecoderName {
  public static definitionName: string = '$Class';
  public static schemaRef: string = '#/definitions/$Class';

  public static decode(json: any): types.$Class {
    return validateJson(json, $DecoderName.schemaRef, $DecoderName.definitionName);
  }
}
`;

export const modelsTemplate = `
/* eslint-disable */

$Models
`;
