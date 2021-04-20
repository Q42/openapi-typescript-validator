import { format, Options } from "prettier";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

export function generateMetaFile(
  definitionNames: string[],
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
): void {
  const metas = definitionNames
    .map((definitionName) => {
      return `${definitionName}: info<${definitionName}>('${definitionName}', '#/definitions/${definitionName}'),`;
    })
    .join("\n");

  const rawOutput = metaTemplate
    .replace(/\$Definitions/g, metas)
    .replace(/\$ModelImports/g, definitionNames.join(", "))
    .replace(/\$PackageName/g, packageName);

  const output = format(rawOutput, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `meta.ts`), output);
  });
}

const metaTemplate = `
/* eslint-disable */
import { $ModelImports } from './models';

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
`;
