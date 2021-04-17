import { format, Options } from "prettier";
import { metaTemplate } from "../templates";
import { mkdirSync, writeFileSync } from "fs";
import * as path from "path";

export function generateMetaFile(
  definitionNames: string[],
  packageName: string,
  outDirs: string[],
  prettierOptions: Options
): void {
  const metas = definitionNames
    .map((definitionName) => {
      return `${definitionName}: info<${definitionName}>('${definitionName}'),`;
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
