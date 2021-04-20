const {
  dateTime,
  object,
} = require("openapi-typescript-validator");

const types = {};

types.User = object({
  createdAt: dateTime,
});

module.exports = {
  types,
};
