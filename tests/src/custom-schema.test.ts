import path from "path";
import fs from "fs";
const { generate } = require("openapi-typescript-validator");

describe("custom-schema", () => {
  const name = "custom";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
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
      expect(dir).toEqual(["ImageComponent", "Meta", "Screen", "TitleComponent", "helpers.ts", "index.ts"]);
    });

    test('index.ts', () => {
      const file = fs.readFileSync(
        path.join(decodersDir, `index.ts`),
        "utf8"
      );
      expect(file).toMatchSnapshot();
    })
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
