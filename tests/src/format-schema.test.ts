import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from "ajv";
import { describe, beforeAll, it, expect } from "vitest";

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
      directory: generatedDir,
      addFormats: true,

    });
  });

  it("files should match", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "decoders.ts",
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
      "validate.ts",
    ]);
  });

  it("schema should match", async () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8",
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
    expect(await new Ajv().validateSchema(JSON.parse(file))).toEqual(true);
  });

  it("decoders should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8",
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  it("models should match", () => {
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
      directory: generatedDir,
      addFormats: true,
      formatOptions: { mode: "fast", formats: ["date", "time"] },
    });
  });

  it("decoders should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8",
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
    `${name}-standalone`,
  );
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "format-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      addFormats: true,
      standalone: { validatorOutput: "commonjs" },
    });
  });

  it("files should match", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "decoders",
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
      "validate.ts",
    ]);
  });

  describe("User validator", () => {
    it("validator should contain properties", () => {
      const file = fs.readFileSync(
        path.join(generatedDir, `decoders/User/validator.js`),
        "utf8",
      );
      expect(file).not.toBeUndefined();
      expect(file).toContain(
        `require("ajv-formats/dist/formats").fullFormats.date`,
      );
    });
  });
});
