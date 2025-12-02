import path from "path";
import fs from "fs";
import { generate } from "openapi-typescript-validator";
import Ajv from "ajv";
import { describe, beforeAll, it, expect } from "vitest";

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
      esm: true,
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
        "ImageComponent",
        "ListerComponent",
        "Screen",
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

  it("schema should match", async () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `schema.json`),
      "utf8",
    );
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
    expect(await new Ajv().validateSchema(JSON.parse(file))).toEqual(true);
  });

  it("decoders", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8",
    );

    expect(file).toMatchSnapshot();
  });

  it("validators.d.ts", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `validators.d.ts`),
      "utf8",
    );

    expect(file).toMatchSnapshot();
  });

  it("validators.js", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `validators.js`),
      "utf8",
    );

    expect(file).not.toBeUndefined();
  });

  it("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");

    expect(file).toMatchSnapshot();
  });

  it("models should match", () => {
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
    `${name}-ajv-compile`,
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

  it("decoders", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8",
    );

    expect(file).toMatchSnapshot();
  });

  it("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  it("models should match", () => {
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

  it("files", () => {
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

    it("file structure", () => {
      const dir = fs.readdirSync(decodersDir);
      expect(dir).toEqual([
        "ImageComponent",
        "ListerComponent",
        "Screen",
        "index.ts",
      ]);
    });

    it("index.ts", () => {
      const file = fs.readFileSync(path.join(decodersDir, `index.ts`), "utf8");
      expect(file).toMatchSnapshot();
    });

    describe("ImageComponent", () => {
      const componentDir = path.join(decodersDir, `ImageComponent`);

      it("file structure", () => {
        const dir = fs.readdirSync(componentDir);
        expect(dir).toEqual(["decoder.ts", "validator.js"]);
      });

      it("decoder.ts", () => {
        const file = fs.readFileSync(
          path.join(componentDir, `decoder.ts`),
          "utf8",
        );
        expect(file).not.toBeUndefined();
        expect(file).toMatchSnapshot();
      });

      it("validator.js", () => {
        const file = fs.readFileSync(
          path.join(componentDir, `validator.js`),
          "utf8",
        );
        expect(file).not.toBeUndefined();
      });
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

  it("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  it("models should match", () => {
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
    `${name}-commonjs-merged`,
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

  it("files", () => {
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

  it("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });

  it("decoders", () => {
    const file = fs.readFileSync(
      path.join(generatedDir, `decoders.ts`),
      "utf8",
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

  it("files", () => {
    const files = fs.readdirSync(generatedDir);
    expect(files).toEqual([
      "helpers.ts",
      "meta.ts",
      "models.ts",
      "schema.json",
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

  it("helpers.ts", () => {
    const file = fs.readFileSync(path.join(generatedDir, `helpers.ts`), "utf8");
    expect(file).toMatchSnapshot();
  });

  it("models should match", () => {
    const file = fs.readFileSync(path.join(generatedDir, `models.ts`), "utf8");
    expect(file).not.toBeUndefined();
    expect(file).toMatchSnapshot();
  });
});
