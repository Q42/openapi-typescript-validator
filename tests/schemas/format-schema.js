const { date, object, email, number } = require("openapi-typescript-validator");

const types = {};

types.User = object({
  createdAt: date({
    formatMinimum: "2016-02-06",
    formatExclusiveMaximum: "2016-12-27",
  }),
  email: email(),
});

types.Price = object({
  amount: number({
    minimum: 0,
    maximum: 999
  })
})

module.exports = {
  types,
};
