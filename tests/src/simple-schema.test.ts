import path from "path";
import fs from "fs";
const { generate } = require("openapi-typescript-validator");

describe("simple-schema", () => {
  const name = "simple";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    await generate({
      schemaFile: path.join(schemaDir, "simple-schema.yaml"),
      schemaType: "yaml",
      name,
      directory: generatedDir,
    });
  });

  test("schema should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `${name}-schema.json`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual(["User", "helpers.ts", "index.ts"]);
    });

    test('helpers.ts', () => {
      const file = fs.readFileSync(
        path.join(decodersDir, `helpers.ts`),
        "utf8"
      );
      expect(file).toMatchSnapshot();
    })

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
      path.join(generatedDir, `${name}-models.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
