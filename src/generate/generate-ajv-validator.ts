import { format, Options } from "prettier";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function generateAjvValidator(
  prettierOptions: Options,
  outDirs: string[]
) {
  const helpers = await format(helpersTemplate, prettierOptions);

  outDirs.forEach((outDir) => {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `validate.ts`), helpers);
  });
}

const helpersTemplate = `
/* eslint-disable */
import type { ErrorObject } from 'ajv';

export interface Validator {
  (json: unknown): boolean;
  errors?: ErrorObject[] | null;
}

export function validateJson(json: any, validator: Validator, definitionName: string): any {
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json;

  if (validator(jsonObject)) {
    return jsonObject;
  }

  const jsonPreviewStr = (typeof json === 'string' ? json : JSON.stringify(jsonObject)).substring(0, 200);
  if (validator.errors) {
    throw Error(\`\${definitionName} \${errorsText(validator.errors)}. JSON: \${jsonPreviewStr}\`);
  }

  throw Error(\`\${definitionName} Unexpected data received. JSON: \${jsonPreviewStr}\`);
}

function errorsText(errors: ErrorObject[]): string {
  return errors.map(error => \`\${error.instancePath}: \${error.message}\`).join('\\n')
}
`;
