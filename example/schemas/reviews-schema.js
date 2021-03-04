const {
  object,
  string,
  boolean,
  number,
  nillable,
  array,
  ref,
  map,
  compose,
} = require('openapi-typescript-validator');

const types = {};

types.BaseResponse = object({
  HasErrors: boolean,
  Errors: nillable(array('Error')),
});

types.ReviewsResponse = compose(
  types.BaseResponse,
  object({
    Offset: number,
    Limit: number,
    TotalResults: number,
    Results: nillable(array('Review')),
    Includes: ref('Includes'),
  }),
);

types.Includes = object({
  Products: nillable(map('Product')),
});

types.Product = object({
  Id: string,
  Name: nillable(string),
});

types.Review = object({
  Id: string,
  ProductId: string,
  SubmissionId: string,
  SubmissionTime: string,
  Title: nillable(string),
  ReviewText: nillable(string),
  UserNickname: nillable(string),
  Rating: number,
  IsRecommended: nillable(boolean),
  TotalNegativeFeedbackCount: number,
  TotalPositiveFeedbackCount: number,
});

types.Error = object({
  Code: string,
  Message: string,
});

module.exports = { types };
