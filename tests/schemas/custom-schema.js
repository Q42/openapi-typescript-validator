const { anyOf, array, constant, nillable, object, string, ref } = require('openapi-typescript-validator');

const types = {};

types.Screen = object({
  components: array('Component'),
})

types.Component = anyOf(['TitleComponent', 'ImageComponent']);

types.TitleComponent = object({
  type: constant('title'),
  title: string(),
  subtitle: nillable(string({ description: 'some description' })),
  meta: ref('Meta'),
}, {
  description: 'Title component'
});

types.ImageComponent = object({
  type: constant('image'),
  url: string(),
  meta: ref('Meta'),
});

types.Meta = object({
  dateTime: string(),
})

module.exports = {
  types,
  decoders: ['Screen', 'ImageComponent']
}