const path = require("path");
const { generate } = require("openapi-typescript-validator");

async function main() {
  await generate({
    schemaFile: path.join(__dirname, "schemas/simple-schema.yaml"),
    schemaType: "yaml",
    name: "simple",
    directory: path.join(__dirname, "/generated"),
  });

  await generate({
    schemaFile: path.join(__dirname, "schemas/complex-schema.json"),
    schemaType: "json",
    name: "complex",
    directory: path.join(__dirname, "/generated"),
  });

  await generate({
    schemaFile: path.join(__dirname, "schemas/custom-schema.js"),
    schemaType: "custom",
    name: "custom",
    directory: path.join(__dirname, "/generated"),
  });

  await generate({
    schemaFile: path.join(__dirname, "schemas/reviews-schema.js"),
    schemaType: "custom",
    name: "reviews",
    directory: path.join(__dirname, "/generated"),
  });

  await generate({
    schemaFile: path.join(__dirname, "schemas/compose-schema.js"),
    schemaType: "custom",
    name: "compose",
    directory: path.join(__dirname, "/generated"),
  });
}

main();
