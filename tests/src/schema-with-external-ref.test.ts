import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";

describe("schema-with-external-ref", () => {
  const name = "schema-with-external-ref";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
  });

  test('schema with external ref', async () => {
    await generate({
      schemaFile: path.join(schemaDir, "schema-with-external-ref.yaml"),
      schemaType: "yaml",
      directory: generatedDir
    });
  });

});
