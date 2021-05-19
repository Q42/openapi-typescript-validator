import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from 'ajv';

describe("simple-schema", () => {
  const name = "simple";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir)) fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "simple-schema.yaml"),
      schemaType: "yaml",
      name,
      directory: generatedDir,
      standalone: {
        validatorOutput: 'module',
      }
    });
  });

  test("meta.ts", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `meta.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
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

  test('helpers.ts', () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `helpers.ts`),
      "utf8"
    );
    expect(file).toMatchSnapshot();
  })

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual(["User", "index.ts"]);
    });

    test('index.ts', () => {
      const file = fs.readFileSync(
        path.join(decodersDir, `index.ts`),
        "utf8"
      );
      expect(file).toMatchSnapshot();
    })

    describe("UserDecoder", () => {
      const userDecoderDir = path.join(decodersDir, `User`);

      test("file structure", () => {
        const dir = fs.readdirSync(userDecoderDir);
        expect(dir).toEqual(["decoder.ts", "validator.d.ts", "validator.js"]);
      });

      test("decoder", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `decoder.ts`),
          "utf8"
        );

        expect(file).toMatchSnapshot();
      });

      test("validator.d.ts", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `validator.d.ts`),
          "utf8"
        );

        expect(file).toMatchSnapshot();
      });

      test("validator.js", () => {
        const file = fs.readFileSync(
          path.join(userDecoderDir, `validator.js`),
          "utf8"
        );

        expect(file).toMatchSnapshot();
      });
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
