import { FormatName } from "ajv-formats";
import { JSONSchema } from "json-schema-to-typescript";
import { JSONSchemaTypeName } from "json-schema-to-typescript/dist/src/types/JSONSchema";

type SchemaObject = JSONSchema;
type SchemaObjectOrRef = SchemaObject | string;

interface CustomSchemaObject {
  kind: "custom";
  object: SchemaObject;
  optional?: boolean;
}

type PropertyValue = SchemaObject | CustomSchemaObject;

type PropertyBaseOptions = Pick<
  JSONSchema,
  "title" | "description" | "default"
>;

type ObjectBaseOptions = Pick<
  JSONSchema,
  "title" | "description" | "default"
>;

type ArrayOptions = PropertyBaseOptions;

type StringOptions = PropertyBaseOptions &
  Pick<JSONSchema, "minLength" | "maxLength" | "pattern">;

type NumberOptions = PropertyBaseOptions &
  Pick<
    JSONSchema,
    | "exclusiveMinimum"
    | "exclusiveMaximum"
    | "maximum"
    | "minimum"
    | "multipleOf"
  >;

type BooleanOptions = PropertyBaseOptions;

// https://ajv.js.org/packages/ajv-formats.html#keywords-to-compare-values-formatmaximum-formatminimum-and-formatexclusivemaximum-formatexclusiveminimum
interface FormatOptions extends StringOptions {
  formatMinimum?: string;
  formatMaximum?: string;
  formatExclusiveMinimum?: string;
  formatExclusiveMaximum?: string;
}

export const string = (options: StringOptions = {}): PropertyValue => ({
  type: "string",
  ...options,
});

export const number = (options: NumberOptions = {}): PropertyValue => ({
  type: "number",
  ...options,
});

export const boolean = (options: BooleanOptions = {}): PropertyValue => ({
  type: "boolean",
  ...options,
});

export const any = (options: JSONSchema = {}): PropertyValue => ({
  ...options
})

export const anonymousData = (options: JSONSchema): PropertyValue => ({
  additionalProperties: { type: "string" },
  ...options,
});


const stringFormat = (format: FormatName) => (
  options: FormatOptions = {}
): PropertyValue => {
  return {
    type: "string",
    format,
    ...(options ?? {}),
  };
};

export const date = stringFormat("date");
export const time = stringFormat("time");
export const dateTime = stringFormat("date-time");
export const duration = stringFormat("duration");
export const uri = stringFormat("uri");
export const uriReference = stringFormat("uri-reference");
export const uriTemplate = stringFormat("uri-template");
export const email = stringFormat("email");
export const hostname = stringFormat("hostname");
export const ipv4 = stringFormat("ipv4");
export const ipv6 = stringFormat("ipv6");
export const regex = stringFormat("regex");
export const uuid = stringFormat("uuid");
export const jsonPointer = stringFormat("json-pointer");
export const relativeJsonPointer = stringFormat("relative-json-pointer");

export const object = (
  properties: Record<string, PropertyValue>,
  options: ObjectBaseOptions = {},
): SchemaObject => {
  const required: string[] = [];
  const schemaProperties: Record<string, SchemaObject> = {};

  Object.entries(properties).forEach(([key, property]) => {
    if (property.kind === "custom") {
      if (!property.optional) {
        required.push("key");
      }
      schemaProperties[key] = property.object;
    } else {
      required.push(key);
      schemaProperties[key] = property;
    }
  });

  return {
    type: "object",
    properties: schemaProperties,
    required: required.length === 0 ? undefined : required,
    ...options,
  };
};

export const ref = (refName: string): SchemaObject => ({
  $ref: `#/definitions/${refName}`,
});

const autoRef = (type: SchemaObjectOrRef): SchemaObject =>
  typeof type === "string" ? ref(type) : type;

export const array = (itemType: SchemaObjectOrRef, options: ArrayOptions = {}): SchemaObject => ({
  type: "array",
  items: autoRef(itemType),
  ...options,
});

export const map = (itemType: SchemaObjectOrRef): SchemaObject => ({
  type: "object",
  patternProperties: {
    ".*": autoRef(itemType),
  },
  additionalProperties: false,
});

export const nullable = (type: SchemaObjectOrRef): SchemaObject => {
  const obj = autoRef(type);

  const types: JSONSchemaTypeName[] = [
    "string",
    "number",
    "boolean",
    "integer",
  ];

  if (typeof obj.type === "string" && types.includes(obj.type)) {
    return {
      ...obj,
      type: [obj.type, "null"],
    };
  }

  return anyOf([obj, { type: "null" }]);
};

export const nillable = (type: SchemaObjectOrRef): SchemaObject =>
  optional(nullable(type));

export const optional = (type: SchemaObjectOrRef): CustomSchemaObject => ({
  kind: "custom",
  object: autoRef(type),
  optional: true,
});

export const oneOf = (types: SchemaObjectOrRef[]): SchemaObject => ({
  oneOf: types.map(autoRef),
});

export const anyOf = (types: SchemaObjectOrRef[]): SchemaObject => ({
  anyOf: types.map(autoRef),
});

export const enumerate = (values: string[]): SchemaObject => ({
  type: "string",
  enum: values,
});

export const constant = (value: string): SchemaObject => ({
  type: "string",
  enum: [value],
});

export const compose = (...sources: SchemaObject[]): SchemaObject => {
  if (sources === undefined) {
    throw new Error(`Sources for 'compose' cannot be undefined`);
  }

  const properties: SchemaObject["properties"] = {};
  const requiredRecord: Record<string, boolean> = {};

  sources.forEach((source) => {
    Object.assign(properties, source.properties);
    if (Array.isArray(source.required)) {
      source.required.forEach((key) => {
        requiredRecord[key] = true;
      });
    }
  });

  const required = Object.keys(requiredRecord);

  return {
    type: "object",
    properties,
    required: required.length === 0 ? undefined : required,
  };
};
