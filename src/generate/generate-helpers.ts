import { format, Options } from "prettier";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function generateHelpers(
  prettierOptions: Options,
  outDirs: string[]
) {
  const helpers = await format(helpersTemplate, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `helpers.ts`), helpers);
  });
}

const helpersTemplate = `
/* eslint-disable */

export interface Decoder<T> {
  definitionName: string;
  schemaRef: string;
  decode: (json: unknown) => T;
}
`;
