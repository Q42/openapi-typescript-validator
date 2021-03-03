const { anyOf, array, constant, nillable, object, string } = require('openapi-typescript-validator');

const types = {};

types.Screen = object({
  components: array('Component'),
})

types.Component = anyOf(['TitleComponent', 'ImageComponent']);

types.TitleComponent = object({
  type: constant('title'),
  title: string,
  subtitle: nillable(string),
});

types.ImageComponent = object({
  type: constant('image'),
  url: string,
});

module.exports = { types }