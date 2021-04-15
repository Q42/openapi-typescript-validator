import { JSONSchema } from 'json-schema-to-typescript';
import { JSONSchemaTypeName } from 'json-schema-to-typescript/dist/src/types/JSONSchema';

type SchemaObject = JSONSchema;
type SchemaObjectOrRef = SchemaObject | string

interface CustomSchemaObject {
  kind: 'custom'
  object: SchemaObject;
  optional?: boolean;
}

type PropertyValue = SchemaObject | CustomSchemaObject;

export const boolean: SchemaObject = { type: 'boolean' };
export const id: SchemaObject = { type: 'string', minLength: 1 };
export const positiveInteger: SchemaObject = { type: 'integer', minimum: 0 };
export const string: SchemaObject = { type: 'string' };
export const number: SchemaObject = { type: 'number' };
export const date: SchemaObject = { type: 'string', format: 'date' };
export const dateTime: SchemaObject = { type: 'string', format: 'date-time' };
export const uri: SchemaObject = { type: 'string', format: 'uri' };
export const email: SchemaObject = { type: 'string', format: 'email' };
export const any: SchemaObject = {};
export const anonymousData: SchemaObject = { additionalProperties: { type: 'string' } };

export const object = (properties: Record<string, PropertyValue>): SchemaObject => {

  const required: string[] = [];
  const schemaProperties: Record<string, SchemaObject> = {}

  Object.entries(properties).forEach(([key, property]) => {
    if (property.kind === 'custom') {
      if (!property.optional) {
        required.push('key');
      }
      schemaProperties[key] = property.object;
    } else {
      required.push(key);
      schemaProperties[key] = property;
    }
  })

  return {
    type: 'object',
    properties: schemaProperties,
    required
  };
}

export const ref = (refName: string): SchemaObject => ({
   $ref: `#/definitions/${refName}`
});

const autoRef = (type: SchemaObjectOrRef): SchemaObject => typeof type === 'string' ? ref(type) : type;

export const array = (itemType: SchemaObjectOrRef): SchemaObject => ({ type: 'array', items: autoRef(itemType) });

export const map = (itemType: SchemaObjectOrRef): SchemaObject => ({
  type: 'object',
  patternProperties: {
    '.*': autoRef(itemType),
  },
  additionalProperties: false,
});

export const nullable = (type: SchemaObjectOrRef): SchemaObject => {
  const obj = autoRef(type);

  const types: JSONSchemaTypeName[] = ['string', 'number', 'boolean', 'integer']

  if (typeof obj.type === 'string' && types.includes(obj.type)) {
    return {
      ...obj,
      type: [obj.type, 'null'],
    };
  }

  return anyOf([obj, { type: 'null' }]);
};

export const nillable = (type: SchemaObjectOrRef): SchemaObject => optional(nullable(type));

export const optional = (type: SchemaObjectOrRef): CustomSchemaObject => ({ kind: 'custom', object: autoRef(type), optional: true });

export const oneOf = (types: SchemaObjectOrRef[]): SchemaObject => ({ oneOf: types.map(autoRef) });

export const anyOf = (types: SchemaObjectOrRef[]): SchemaObject => ({ anyOf: types.map(autoRef) });

export const enumerate = (values: string[]): SchemaObject => ({ type: 'string', enum: values });

export const constant = (value: string): SchemaObject => ({ type: 'string', enum: [value] });

export const compose = (...sources: SchemaObject[]): SchemaObject => {
  if (sources === undefined) {
    throw new Error(`Sources for 'compose' cannot be undefined`);
  }

  const properties: SchemaObject['properties'] = {}
  const requiredRecord: Record<string, boolean> = {};

  sources.forEach(source => {
    Object.assign(properties, source.properties);
    if (Array.isArray(source.required)) {
      source.required.forEach(key => {
        requiredRecord[key] = true
      })
    }
  })

  return {
    type: 'object',
    properties,
    required: Object.keys(requiredRecord),
  }
};
