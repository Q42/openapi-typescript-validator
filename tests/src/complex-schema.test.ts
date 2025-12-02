import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from "ajv";
import { describe, beforeAll, it, expect } from "vitest";

describe("complex-schema", () => {
  const name = "complex";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "complex-schema.json"),
      schemaType: "json",
      directory: generatedDir,
      standalone: {
        validatorOutput: "module",
      },
    });
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

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    it("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "Component",
        "ImageComponent",
        "Screen",
        "TitleComponent",
        "index.ts",
      ]);
    });

    it("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });
  });

  it("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
