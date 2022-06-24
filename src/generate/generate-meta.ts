import { format, Options } from "prettier";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { ValidatorOutput } from "../GenerateOptions";

export function generateMetaFile(
  definitionNames: string[],
  outDirs: string[],
  prettierOptions: Options,
  esm: boolean
): void {
  const metas = definitionNames
    .map((definitionName) => {
      return `${definitionName}: info<${definitionName}>('${definitionName}', '#/definitions/${definitionName}'),`;
    })
    .join("\n");

  const rawOutput = metaTemplate(esm)
    .replace(/\$Definitions/g, metas)
    .replace(/\$ModelImports/g, definitionNames.join(", "))

  const output = format(rawOutput, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `meta.ts`), output);
  });
}

const metaTemplate = (esm: boolean) => {
  const importExtension = esm ? ".js" : "";
  return `
/* eslint-disable */
import { $ModelImports } from './models${importExtension}';

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
`
}
