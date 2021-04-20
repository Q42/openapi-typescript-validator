const { date, object, email } = require("openapi-typescript-validator");

const types = {};

types.User = object({
  createdAt: date({
    formatMinimum: "2016-02-06",
    formatExclusiveMaximum: "2016-12-27",
  }),
  email: email(),
});

module.exports = {
  types,
};
