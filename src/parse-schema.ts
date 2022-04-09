import jsYaml from 'js-yaml'
import { JSONSchema } from 'json-schema-to-typescript';
import $RefParser from  '@apidevtools/json-schema-ref-parser';
import { readFileSync } from 'fs';
import { dirname } from 'path';

const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');

export type SchemaType = 'yaml' | 'json' | 'custom';

export interface ParsedSchema {
  json: string;
  definitions: Record<string, JSONSchema>;
  whitelistedDecoders: string[] | undefined;
}

export async function parseSchema(inputFilePath: string, schemaType: SchemaType): Promise<ParsedSchema> {
  switch (schemaType) {
    case 'json':
    case 'yaml':
      return parseOpenApiSchema(inputFilePath, schemaType);
    case 'custom':
      return parseCustomSchema(inputFilePath);
  }
}

async function parseOpenApiSchema(inputFilePath: string, schemaType: 'yaml' | 'json'): Promise<ParsedSchema> {
  let schema: any;

  const inputFileContent = readFileSync(inputFilePath, 'utf8');

  if (schemaType === 'yaml') {
    schema = jsYaml.load(inputFileContent);
  } else {
    schema = JSON.parse(inputFileContent);
  }

  // need to change to input file base directory, so relative ref paths can be resolved
  const originalDirectory = process.cwd();
  process.chdir(dirname(inputFilePath));
  // resolve external references to original schema
  schema = await $RefParser.bundle(schema)
  // change back to original directory
  process.chdir(originalDirectory);

  const properties: Record<string, any> = {};
  const definitions: Record<string, JSONSchema> = {};

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

  return {
    json: schemaJsonOutput,
    definitions,
    whitelistedDecoders: undefined,
  }
}

function parseCustomSchema(inputFilePath: string): ParsedSchema {
  const schema = require(inputFilePath);

  if (typeof schema.types !== 'object') {
    throw new Error('schema "types" should be an object');
  }

  const properties: Record<string, any> = {};
  const definitions: Record<string, any> = {}

  Object.entries(schema.types).forEach(([key, value]) => {
    properties[key] = { $ref: `#/definitions/${key}` };
    definitions[key] = value;
  });

  const schemaJsonOutput = JSON
    .stringify({
      type: 'object',
      title: 'Schema',
      definitions,
      properties,
    }, undefined, 2);

  return {
    json: schemaJsonOutput,
    definitions,
    whitelistedDecoders: schema.decoders,
  }
}
