const path = require('path');
const { generate } = require('openapi-typescript-generator');

async function main() {
  await generate({
    schemaFile: path.join(__dirname, 'schemas/simple-schema.yaml'),
    schemaType: 'yaml',
    name: 'simple',
    directory: path.join(__dirname, '/generated')
  })

  await generate({
    schemaFile: path.join(__dirname, 'schemas/complex-schema.json'),
    schemaType: 'json',
    name: 'complex',
    directory: path.join(__dirname, '/generated')
  })
}

main()