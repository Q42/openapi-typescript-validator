import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from 'ajv';

describe("format-schema - compile based", () => {
  const name = "format";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "format-schema.js"),
      schemaType: "custom",
      name,
      directory: generatedDir,
      addFormats: true,
    });
  });

  test("files should match", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "decoders.ts",
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
    ]);
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

  test("decoders should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});

describe("format-schema - compile based - options", () => {
  const name = "format";
  const generatedDir = path.join(__dirname, "../generated", `${name}-options`);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "format-schema.js"),
      schemaType: "custom",
      name,
      directory: generatedDir,
      addFormats: true,
      formatOptions: { mode: "fast", formats: ["date", "time"] },
    });
  });

  test("decoders should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});

describe("format-schema - standalone", () => {
  const name = "format";
  const generatedDir = path.join(
    __dirname,
    "../generated",
    `${name}-standalone`
  );
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "format-schema.js"),
      schemaType: "custom",
      name,
      directory: generatedDir,
      addFormats: true,
      standalone: { validatorOutput: "commonjs" },
    });
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

  describe("User validator", () => {
    test("validator should contain properties", () => {
      const file = fs.readFileSync(
        path.join(generatedDir, `decoders/User/validator.js`),
        "utf8"
      );
      expect(file).not.toBeUndefined();
      expect(file).toContain(`require("ajv-formats/dist/formats").fullFormats.date`);
    });
  });
});
