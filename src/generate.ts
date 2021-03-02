import * as path from 'path';
import { compile } from 'json-schema-to-typescript'
import { decoderTemplate, rootTemplate } from './templates';
import { sha1 } from 'object-hash';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import jsYaml from 'js-yaml'
import { format, Options } from 'prettier';
const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');

export interface GenerateOptions {
  schemaFile: string;
  schemaType: 'yaml' | 'json';
  name: string;
  directory: string;
  prettierOptions?: Options
}

export async function generate(options: GenerateOptions) {
  const { directory, name, schemaFile, schemaType } = options;

  const prettierOptions = options.prettierOptions ?? { parser: 'typescript' };

  let schema: any;

  if (schemaType === 'yaml') {
    schema = jsYaml.load(readFileSync(schemaFile, 'utf8'));
  } else {
    schema = JSON.parse(readFileSync(schemaFile, 'utf8'));
  }

  const properties: Record<string, any> = {};
  const definitions: Record<string, any> = {}

  Object.entries(schema.components.schemas).forEach(([key, value]) => {
    properties[key] = { $ref: `#/definitions/${key}` };
    definitions[key] = toJsonSchema(value);
  });

  // open api is a bit different so we need to creata a different schema
  const schemaJsonOutput = JSON
    .stringify({
      type: 'object',
      title: 'Schema',
      definitions,
      properties,
    }, undefined, 2)
    .replace(/\#\/components\/schemas/g, '#/definitions')

  const rawTypescriptModels = (await compile(JSON.parse(schemaJsonOutput), 'Schema'))
    .replace(/\/\*\*[^]*?\*\//, '')
    .replace(/\s*\[k: string\]: unknown;/g, '') // Allow additional properties in schema but not in typescript
    .replace(/export interface Schema \{[^]*?\n\}/, '');

  const typescriptModels = format(rawTypescriptModels, prettierOptions);

  const validators = Object.entries(definitions)
    .filter(([name, definition]) => definition.type === 'object')
    .map(([definitionName]) => decoderTemplate
      .replace(/\$Class/g, definitionName)
      .trim()
    )
    .join('\n');

  const rawDecoderOutput = rootTemplate
    .replace(/\$SchemaName/g, name)
    .replace(/\$SchemaHash/g, sha1(schemaJsonOutput).substr(-6))
    .replace(/\$Validators/g, validators);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, `${name}-models.ts`), typescriptModels);
  writeFileSync(path.join(directory, `${name}-decoders.ts`), decoderOutput);
  writeFileSync(path.join(directory, `${name}-schema.json`), schemaJsonOutput);
}
