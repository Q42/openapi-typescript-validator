import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";

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
      standalone: true,
    });
  });

  test("schema should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "ImageComponent",
        "Screen",
        "helpers.ts",
        "index.ts",
      ]);
    });

    test("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });
  });

  test("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});

describe("custom-schema - merged", () => {
  const name = "custom";
  const generatedDir = path.join(__dirname, "../generated", `${name}-merged`);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      name,
      directory: generatedDir,
      mergeDecoders: true,
      standalone: true,
    });
  });

  test("schema should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("decoders", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8"
    );

    expect(file).toMatchSnapshot();
  });

  test("validators.d.ts", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `validators.d.ts`),
      "utf8"
    );

    expect(file).toMatchSnapshot();
  });

  test("validators.js", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `validators.js`),
      "utf8"
    );

    expect(file).not.toBeUndefined();
  });

  test("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");

    expect(file).toMatchSnapshot();
  });

  test("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});

describe("custom-schema - ajv compile", () => {
  const name = "custom";
  const generatedDir = path.join(
    __dirname,
    "../generated",
    `${name}-ajv-compile`
  );
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
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual(['decoders.ts', 'helpers.ts', 'meta.ts', 'models.ts', 'schema.json']);
  });

  test("schema should match", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8"
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  test("decoders", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8"
    );

    expect(file).toMatchSnapshot();
  });

  test("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  test("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
