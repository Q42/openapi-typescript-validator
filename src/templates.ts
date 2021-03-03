export const decodersTemplate = `
/* eslint-disable */
/* tslint-disable */
import Ajv, { ErrorObject } from 'ajv';
import schema from './$SchemaName-schema.json';
import * as types from './$SchemaName-models'

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! AUTO GENERATED CODE, DON'T TOUCH !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const ajv = new Ajv();
ajv.addSchema(schema);

function validateJson(json: any, schemaRef: string, className: string): any {
  const schema = ajv.getSchema(schemaRef);
  if (!schema) {
    throw new Error(\`Schema \${schemaRef} not found\`);
  }

  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json;

  if (schema(jsonObject)) {
    return jsonObject;
  }

  const jsonPreviewStr = (typeof json === 'string' ? json : JSON.stringify(jsonObject)).substring(0, 100);
  if (schema.errors) {
    throw Error(\`\${className} \${errorsText(schema.errors)}. JSON-preview: \${jsonPreviewStr}\`);
  }

  throw Error(\`\${className} Unexpected data received. JSON: \${jsonPreviewStr}\`);
}

function errorsText(errors: ErrorObject[]): string {
  return errors.map(error => \`\${error.dataPath}: \${error.message}\`).join('\\n')
}

// Decoders
$Decoders
`;

export const decoderTemplate = `
export class $ClassDecoder {
  public static schemaRef: string = '#/definitions/$Class'

  public static decode(json: any): types.$Class {
    return validateJson(json, $ClassDecoder.schemaRef, '$Class');
  }
}
`;

export const modelsTemplate = `
/* eslint-disable */

$Models
`;

export const schemaJsonTemplate = `$SchemaOutput`;