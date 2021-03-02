# openapi-typescript-generator
Generate typescript with ajv validation based on openapi schemas

- [What does this do?](#what-does-this-do)
- [Getting started](#getting-started)
- [Documentation](#documentation)
  - [generate](#generate)

## What does this do?

This package will convert your `openapi 3.0` spec to:
- Typescript models
- Decoders which validate your models against a JSON schema

### Example
This schema (note: also works with JSON based schema's)
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
      required: ['id']
```

Will convert to:

```typescript
export interface User {
  id: string;
  name?: string;
}
```

And will generate a decoder:

```typescript
// user will be of type User if the JSON is valid
const user = UserDecoder.decode(json);
```

If the JSON is invalid, it will throw an error:

```typescript
const user = UserDecoder.decode({
  id: 1
});

// User: /id: should be string. JSON: {"id":1}
```

### References
References als work, this schema

```json
{
  "components": {
    "schemas": {
      "Screen": {
        "type": "object",
        "properties": {
          "components": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/Component" }
          }
        },
        "required": [ "components" ]
      },

      "Component": {
        "oneOf": [
          { "$ref": "#/components/schemas/TitleComponent" },
          { "$ref": "#/components/schemas/ImageComponent" }
        ]
      },

      "TitleComponent": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["title"]
          },
          "title": {
            "type": "string"
          }
        },
        "required": [ "type", "title" ]
      },

      "ImageComponent": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["image"]
          },
          "url": {
            "type": "string"
          }
        },
        "required": [ "type", "url" ]
      }
    }
  }
}
```

will generate

```typescript
export type Component = TitleComponent | ImageComponent;

export interface Screen {
  components: Component[];
}
export interface TitleComponent {
  type: "title";
  title: string;
}
export interface ImageComponent {
  type: "image";
  url: string;
}
```


## Getting started

Install the package
```
npm i openapi-typescript-generator --save-dev
```

We use [ajv](https://github.com/ajv-validator/ajv) for the decoders
```
npm i ajv
```

Your `tsconfig.json` file will need to be able to resolve the json files.
```json
"resolveJsonModule": true
```

Create a node script called `generate-schemas.js`
```javascript

const path = require('path');
const { generate } = require('openapi-typescript-generator');

generate({
  schemaFile: path.join(__dirname, 'myswagger.yaml'),
  schemaType: 'yaml',
  name: 'api',
  directory: path.join(__dirname, '/generated')
})

```

and run `node generate-schemas.js`

## Documentation

### generate
`generate` can be called with `GenerateOptions`

param | required | description
----- | -------- | -----------
schemaFile | true | file location of the schema.
schemaType | true | `yaml` or `json`
name | true | prefix for the generated files
directory | true | location where the output files will be stored to
prettierOptions | false | See [Prettier Options](https://prettier.io/docs/en/options.html)

