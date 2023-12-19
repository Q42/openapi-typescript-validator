import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { compile } from "json-schema-to-typescript";
import { format, Options } from "prettier";
import { ParsedSchema } from "../parse-schema";
import { GenerateOptions } from "../GenerateOptions";

export async function generateModels(
  schema: ParsedSchema,
  options: Pick<GenerateOptions, "skipSchemaFile">,
  prettierOptions: Options,
  outDirs: string[]
): Promise<void> {
  const compiledTypescriptModels = await compile(
    JSON.parse(schema.json),
    "Schema"
  );
  const rawTypescriptModels = modelsFileTemplate
    .replace(/\$Models/g, compiledTypescriptModels)
    .replace(/\s*\[k: string\]: unknown;/g, "") // Allow additional properties in schema but not in typescript
    .replace(/export interface Schema \{[^]*?\n\}/, "");

  const typescriptModels = await format(rawTypescriptModels, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });

    writeFileSync(path.join(outDir, `models.ts`), typescriptModels);

    if (options.skipSchemaFile !== true) {
      writeFileSync(path.join(outDir, `schema.json`), schema.json);
    }
  });
}

const modelsFileTemplate = `
$Models
`;
