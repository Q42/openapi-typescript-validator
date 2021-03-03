import { JSONSchema } from 'json-schema-to-typescript';
import { JSONSchemaTypeName } from 'json-schema-to-typescript/dist/src/types/JSONSchema';

type SchemaObject = JSONSchema;
type SchemaObjectOrRef = SchemaObject | string

export const boolean = { type: 'boolean' };
export const id = { type: 'string', minLength: 1 };
export const positiveInteger = { type: 'integer', minimum: 0 };
export const string = { type: 'string' };
export const number = { type: 'number' };
export const date = { type: 'string', format: 'date' };
export const dateTime = { type: 'string', format: 'date-time' };
export const uri = { type: 'string', format: 'uri' };
export const email = { type: 'string', format: 'email' };
export const any = {};
export const anonymousData = { additionalProperties: { type: 'string' } };

export const object = (properties: Record<string, any>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties).filter(key => !properties[key].$optional),
});

export const ref = (refName: string) => ({
   $ref: `#/definitions/${refName}`
});

const autoRef = (type: SchemaObjectOrRef) => typeof type === 'string' ? ref(type) : type;

export const array = (itemType: SchemaObjectOrRef) => ({ type: 'array', items: autoRef(itemType) });

export const map = (itemType: SchemaObjectOrRef) => ({
  type: 'object',
  patternProperties: {
    '.*': autoRef(itemType),
  },
  additionalProperties: false,
});

export const nullable = (type: SchemaObjectOrRef): SchemaObject => {
  const obj = autoRef(type);

  if ('type' in obj && obj.type && ['string', 'number', 'boolean', 'integer'].includes(obj.typy)) {
    return {
      ...obj,
      type: [obj.type as JSONSchemaTypeName, 'null'],
    };
  }

  return anyOf([obj, { type: 'null' }]);
};

export const nillable = (type: SchemaObjectOrRef) => optional(nullable(type));

export const optional = (type: SchemaObjectOrRef) => ({ ...autoRef(type), $optional: true });

export const oneOf = (types: SchemaObjectOrRef[]) => ({ oneOf: types.map(autoRef) });

export const anyOf = (types: SchemaObjectOrRef[]) => ({ anyOf: types.map(autoRef) });

export const enumerate = (values: string[])  => ({ type: 'string', enum: values });

export const constant = (value: string) => ({ type: 'string', enum: [value] });

export const compose = (...sources: SchemaObject[]) => {
  if (sources === undefined) {
    throw new Error(`Sources for 'compose' cannot be undefined`);
  }

  return object(Object.assign({}, ...sources.map(obj => obj.properties)));
};