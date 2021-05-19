const {
  object,
  string,
  number,
  compose,
  constant,
  anyOf,
  nillable
} = require("openapi-typescript-validator");

const types = {};

types.BaseComponent = object({
  id: string(),
});

types.FooComponent = compose(
  types.BaseComponent,
  object({
    type: constant("foo"),
    tag: nillable(number()),
  })
);

types.BarComponent = compose(
  types.BaseComponent,
  object({
    type: constant("bar"),
    name: string(),
  })
);

types.AnyComponent = anyOf(["BarComponent", "FooComponent"]);

module.exports = { types };
