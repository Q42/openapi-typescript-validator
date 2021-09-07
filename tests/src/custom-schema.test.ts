import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from "ajv";

describe("custom-schema - standalone ES6", () => {
  const name = "custom";
  const generatedDir = path.join(__dirname, "../generated", name);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      standalone: {
        validatorOutput: "module",
      },
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
      "validate.ts",
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

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "ImageComponent",
        "ListerComponent",
        "Screen",
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

describe("custom-schema - standalone ES6 merged", () => {
  const name = "custom";
  const generatedDir = path.join(__dirname, "../generated", `${name}-merged`);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      standalone: {
        mergeDecoders: true,
        validatorOutput: "module",
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
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
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
      "validate.ts",
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

describe("custom-schema - standalone commonjs", () => {
  const name = "custom";
  const generatedDir = path.join(__dirname, "../generated", `${name}-commonjs`);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      standalone: {
        validatorOutput: "commonjs",
      },
    });
  });

  test("files", () => {
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

  describe("decoders", () => {
    const decodersDir = path.join(generatedDir, `decoders`);

    test("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "ImageComponent",
        "ListerComponent",
        "Screen",
        "index.ts",
      ]);
    });

    test("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });

    describe("ImageComponent", () => {
      const componentDir = path.join(decodersDir, `ImageComponent`);

      test("file structure", () => {
        const dir = fs.readdirSync(componentDir);
        expect(dir).toEqual(["decoder.ts", "validator.js"]);
      });

      test("decoder.ts", () => {
        const file = fs.readFileSync(
          path.join(componentDir, `decoder.ts`),
          "utf8"
        );
        expect(file).not.toBeUndefined();
        expect(file).toMatchSnapshot();
      });

      test("validator.js", () => {
        const file = fs.readFileSync(
          path.join(componentDir, `validator.js`),
          "utf8"
        );
        expect(file).not.toBeUndefined();
      });
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

describe("custom-schema - standalone commonjs merged", () => {
  const name = "custom";
  const generatedDir = path.join(
    __dirname,
    "../generated",
    `${name}-commonjs-merged`
  );
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      standalone: {
        mergeDecoders: true,
        validatorOutput: "commonjs",
      },
    });
  });

  test("files", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "decoders.ts",
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
      "validate.ts",
      "validators.js",
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

  test("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  test("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
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
});

describe("custom-schema - no decoders", () => {
  const name = "custom-no-decoders";
  const generatedDir = path.join(__dirname, "../generated", `${name}-commonjs`);
  const schemaDir = path.join(__dirname, "../schemas");

  beforeAll(async () => {
    if (fs.existsSync(generatedDir))
      fs.rmdirSync(generatedDir, { recursive: true });
    await generate({
      schemaFile: path.join(schemaDir, "custom-schema.js"),
      schemaType: "custom",
      directory: generatedDir,
      standalone: {
        validatorOutput: "commonjs",
      },
      decoders: [],
    });
  });

  test("files", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
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
