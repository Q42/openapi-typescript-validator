import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from 'ajv';

describe("compose-schema", () => {
  const name = "compose";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir)) fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "compose-schema.js"),
      schemaType: "custom",
      name,
      directory: generatedDir,
      decoders: ['BarComponent', 'FooComponent', 'notfound'],
      standalone: {
        validatorOutput: 'module',
      },
    });
  });

  test("schema should match", async () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
    expect(await new Ajv().validateSchema(JSON.parse(file))).toEqual(true);
  });

  test("files should match", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "decoders",
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
    ]);
  });

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "BarComponent",
        "FooComponent",
        "index.ts",
      ]);
    });

    test("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });
  });

  test("models should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `models.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
