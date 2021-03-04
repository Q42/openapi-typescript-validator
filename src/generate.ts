import * as path from 'path';
import { compile } from 'json-schema-to-typescript'
import { decoderTemplate, decodersTemplate, modelsTemplate } from './templates';
import { mkdirSync, writeFileSync } from 'fs';
import { format, Options } from 'prettier';
import { parseSchema, SchemaType } from './parse-schema';

export interface GenerateOptions {
  schemaFile: string;
  schemaType: SchemaType;
  name: string;
  directory: string | string[];
  prettierOptions?: Options;
}

export async function generate(options: GenerateOptions) {
  const { name, schemaFile, schemaType } = options;
  const prettierOptions = options.prettierOptions ?? { parser: 'typescript' };
  const directories: string[] = typeof options.directory === 'string' ? [options.directory] : options.directory;

  console.info(`Start generating files for ${schemaType} schema: ${schemaFile}`)

  const schema = await parseSchema(schemaFile, schemaType);

  const compiledTypescriptModels = await compile(JSON.parse(schema.json), 'Schema');
  const rawTypescriptModels = modelsTemplate
    .replace(/\$Models/g, compiledTypescriptModels)
    .replace(/\s*\[k: string\]: unknown;/g, '') // Allow additional properties in schema but not in typescript
    .replace(/export interface Schema \{[^]*?\n\}/, '');

  const typescriptModels = format(rawTypescriptModels, prettierOptions);

  const decoders = Object.entries(schema.definitions)
    .filter(([name, definition]) => definition.type === 'object')
    .map(([definitionName]) => decoderTemplate
      .replace(/\$DecoderName/g, `${definitionName}Decoder` )
      .replace(/\$Class/g, definitionName)
      .trim()
    )
    .join('\n');

  const rawDecoderOutput = decodersTemplate
    .replace(/\$SchemaName/g, name)
    .replace(/\$Decoders/g, decoders);

  const decoderOutput = format(rawDecoderOutput, prettierOptions);

  directories.forEach(directory => {
    mkdirSync(directory, { recursive: true });

    writeFileSync(path.join(directory, `${name}-models.ts`), typescriptModels);
    writeFileSync(path.join(directory, `${name}-decoders.ts`), decoderOutput);
    writeFileSync(path.join(directory, `${name}-schema.json`), schema.json);
  })

  console.info(`Successfully generated files for ${schemaFile}`);
}
