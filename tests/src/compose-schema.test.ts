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

  test("decoders should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `${name}-decoders.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("models should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `${name}-models.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("validators.js should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `${name}-validators.js`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("validators.d.ts should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `${name}-validators.d.ts`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
