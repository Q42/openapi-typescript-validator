import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from "ajv";
import { describe, beforeAll, it, expect } from "vitest";

describe("simple-schema", () => {
  const name = "simple";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      await fs.promises.rm(generatedDir, { recursive: true, force: true });

    await generate({
      schemaFile: path.join(schemaDir, "simple-schema.yaml"),
      schemaType: "yaml",
      directory: generatedDir,
      standalone: {
        validatorOutput: "module",
      },
      esm: true
    });
  });

  it("meta.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `meta.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
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

  it("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  it("validate.ts", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `validate.ts`),
      "utf8",
    );
    expect(file).toMatchSnapshot();
  });

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    it("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual(["User", "index.ts"]);
    });

    it("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });

    describe("UserDecoder", () => {
      const userDecoderDir = path.join(decodersDir, `User`);

      it("file structure", () => {
        const dir = fs.readdirSync(userDecoderDir);
        expect(dir).toEqual(["decoder.ts", "validator.d.ts", "validator.js"]);
      });

      it("decoder", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `decoder.ts`),
          "utf8",
        );

        expect(file).toMatchSnapshot();
      });

      it("validator.d.ts", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `validator.d.ts`),
          "utf8",
        );

        expect(file).toMatchSnapshot();
      });

      it("validator.js", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `validator.js`),
          "utf8",
        );

        expect(file).toMatchSnapshot();
      });
    });
  });

  it("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
